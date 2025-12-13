
后端接口有时返回过大，后端就发现可以通过设置 gzip 压缩返回，数据包大小可以明显改善。这件事是发生在后端之间的一些交流结果。（平时返回的 `Content-Encoding: br`）

于是，后端便在下一接口联调时，告诉我，前端请求时，可以设置 gzip 的请求头，具体设置 Accept-Encoding 请求头。第一次设置这个请求 header，便询问这不是后端服务配置的事情吗。后端回应，后端不好配置（差不多是这个意思）。

然后，我在联调这个接口时，便尝试对这个一个请求配置 `headers:{"Accept-Encoding": "gzip"}`(axios)，然后查看效果，翻开 devtool - network ，看到请求头 Accept-Encoding 的值为 `gzip, deflate, br` ，无论我切换大小写，到不会有效果，但将 Accept-Encoding 改为自定义如 `Suni` 等时，请求头设置就会有效。

查阅资料，在 Axios 库 16 年的 Issue 的回答中表示了这个字段确实被 forbidden 了。起先我以为是 XHR 不允许设置，fetch 或许还行。但在 XHR 与 Fetch 的规范中，是联立说明部分 headers 不允许被设置。

只不过在 XHR 中设置会报错，而在 Fetch 中不会报错，但一样是不会有效果。

所以这件事情，依旧需要反馈给后端，让后端或做下服务配置还是其它的。

## 更新 （07.01）

我想试一下是怎样配置接口的 gzip，利用 Next.js 的 API 功能。但是发现，Next.js 返回的数据已经是设置好了 gzip 压缩，即使在返回处设置了 `headers: { 'Content-Encoding': 'br', suni: 'suni' }`。

import RequestButton from './request-button'

<RequestButton /> <small> （你可以打开控制台看下）</small>

返回的结果是：66.5KB 的资源，只传输 580B

### 进一步

稍加研究，资源返回的 `Content-Encoding` 并不一定需要为 `gzip`。返回 `br` 代表着经过了 _Brotli_ 压缩，相较而言 `br` 的解压速度快些，`gzip` 的压缩后尺寸会小些，但悬殊不大。

文件会不会被多次压缩呢？比如预先经过了 gzip 的压缩，再用 br 压缩一次？或许能，但应该是不不好的体验。

返回采用 gzip，还是 br，这是部署服务的返回策略决定的。或许服务框架比我们更了解什么文件用 br，什么文件用 gzip。Vercel 与 Next.js 并没找到怎么从服务端设置压缩方式，更多的是在请求方面设置 `Accept-Encoding`。

## 相关规范

- [https://fetch.spec.whatwg.org/#forbidden-request-header](https://fetch.spec.whatwg.org/#forbidden-request-header)
- [https://xhr.spec.whatwg.org/#the-setrequestheader()-method](<https://xhr.spec.whatwg.org/#the-setrequestheader()-method>)

> A [header](https://fetch.spec.whatwg.org/#concept-header) (name, value) is forbidden request-header if these steps return true:
>
> 1. If name is a [byte-case-insensitive](https://infra.spec.whatwg.org/#byte-case-insensitive) match for one of:
>
>    - `Accept-Charset`
>    - `Accept-Encoding`
>    - `[Access-Control-Request-Headers](https://fetch.spec.whatwg.org/#http-access-control-request-headers)`
>    - `[Access-Control-Request-Method](https://fetch.spec.whatwg.org/#http-access-control-request-method)`
>    - `Connection`
>    - `Content-Length`
>    - `Cookie`
>    - `Cookie2`
>    - `Date`
>    - `DNT`
>    - `Expect`
>    - `Host`
>    - `Keep-Alive`
>    - `[Origin](https://fetch.spec.whatwg.org/#http-origin)`
>    - `Referer`
>    - `Set-Cookie`
>    - `TE`
>    - `Trailer`
>    - `Transfer-Encoding`
>    - `Upgrade`
>    - `Via`
>
>    then return true.
>
> 2. If name when [byte-lowercased](https://infra.spec.whatwg.org/#byte-lowercase) [starts with](https://infra.spec.whatwg.org/#byte-sequence-starts-with) `proxy-` or `sec-`, then return true.
> 3. If name is a [byte-case-insensitive](https://infra.spec.whatwg.org/#byte-case-insensitive) match for one of:
>
>    - `X-HTTP-Method`
>    - `X-HTTP-Method-Override`
>    - `X-Method-Override`
>
>    then:
>
>    1. Let parsedValues be the result of [getting, decoding, and splitting](https://fetch.spec.whatwg.org/#header-value-get-decode-and-split) value.
>    2. [For each](https://infra.spec.whatwg.org/#list-iterate) method of parsedValues: if the [isomorphic encoding](https://infra.spec.whatwg.org/#isomorphic-encode) of method is a [forbidden method](https://fetch.spec.whatwg.org/#forbidden-method), then return true.
>
> 4. Return false.