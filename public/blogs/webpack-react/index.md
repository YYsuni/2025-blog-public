
> Versions: Webpack 5, React 18

这是一篇很久以前就想记录的文章，希望通过自己用 Webpack 直接进行项目开发来熟悉更多较为底层的知识。当时写了一会，便没再继续了。

## 1. 创建项目

### 1.1 初始化

```bash
mkdir webpack-react
cd webpack-react
git init
npm init -y
git branch -M main
code .
```

### 1.2 Webpack 初始化

```bash
npx webpack init # ①
vim .gitignore # ②
git add -A
git commit -m "Webpack Init"
npm run serve # ③
```

① 运行容易报错，重试即可

② 至少输入 `/node_modules` 、`dist`

③ 启动开发

## 2. 安装 React

```bash
npm i react react-dom
npm i -D @types/react @types/react-dom
```

## 3. 配置

1. _tsconfig.json_ 中需要加上：

```json
{
	"compilerOptions": {
		"jsx": "react-jsx",
		"moduleResolution": "node"
	}
}
```

2. 添加 _App.tsx_ 到 _src_ 文件夹中

```tsx
export default function App() {
	return <div>Hello World</div>
}
```

3. _index.ts_ 改为 _index.tsx_

```tsx
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
```

4. _index.html_ 加入 id 为 `root` 的 Element

```html
<body>
	<div id="root" />
</body>
```

5. _webpack.config.js_ 的 entry 改下

```js
const config = {
	entry: './src/index.tsx'
}
```

## 结束

到这里，Webpack + React 的配置就完了，其它更多的是项目方面的定制。

这里上传了一份仓库： [https://github.com/YYsuni/archive-webpack-react](https://github.com/YYsuni/archive-webpack-react)

## 回望

在最开始入门前端时，觉得 webpack 是个陌生又熟悉的东西。那时觉得配置 webpack 不容易，很多需要注意的事项，难以上手。而日常开发中，又很少接触到 Webpack 这一层面。更多的，是在 CRA 或 Next.js 上进行开发，基本上在开发中需要的功能，都能在相应的文档中找到。但当需要更多个性化的配置时，又总绕不开 Webpack 配置。所以总想去多学习、积累，不断看 Webpack 的文档，看 CRA 内部又是怎样配置的。

于是，终于有一天。我想采用 Webpack 原生打包，使我更多地直接接触，熟练使用。工作中直接用 Webpack 开发一些草稿项目，部署测试。在项目中这里自己手动配置下，那里手动配置下。将生产中需要用到的功能，都自己主动学习如何在 Webpack 中配置。

再然后，看看别人的插件是如何开发的。等等、等等。

我以为 Webpack 配置一个项目会稍麻烦。现在却看来稀松平常了。需要怎样的配置、插件、功能，我都知道怎么加。

而现在，更多是使用 Vite + pnpm 开始一个项目，这是一种更流行的做法。我会觉得 Vite 带来的更快的体验，很轻便，不需要怎么配置，也基本满足日常开发。当然有了之前 Webpack 的经验，让我更有底气使用更多的工具，明白它的底层逻辑，知道问题该怎么去解决。

我大概是想说，_“过去觉得困难重重的东西，现在已不再困惑。时过境迁，该去追寻下一个目标了。”_
