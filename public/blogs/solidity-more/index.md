
### 一份公开合约是否能够知道它所有内容？
不行。
1. 合约会有 private 变量，private 意味着不愿意公开，外人无法知道。
2. Creation code 包含所有内容，但是很难解析出可读内容，比如难以解析出 初始化参数
    * 其中包括开发者是否有意为之
    * 编译器的优化与加密

### 如何部署多份文件的合约
合约总体会为一份文件，有一个明确的合约名称，代表主合约，可以引入多份文件，不同文件的 method 也可能被解析出可调用 abi。

调用外部部署好的合约，可以在当前合约中设置好外部合约地址，使用 interface 链接这个合约然后调用。

library 可以单独成合约，部署库时就只需链接无需上线。
```json
 "libraries": {
    "contracts/libraries/NFTDescriptor.sol": {
      "NFTDescriptor": "0x42b24a95702b9986e82d421cc3568932790a48ec"
    }
  }
```
>在 Solidity 中，当一个合约引用了库（Library）时，编译器会生成一个占位符地址，用于在合约代码中标识库的位置。在部署合约之前，需要将这个占位符地址替换为实际部署的库地址。这个过程称为“库链接”（Library Linking）。

### 关键字
暴露合约 method：
* `public` 
* `external` 只可外部调用

`memory` 代表变量不存储，只存在内存

`abi` 是 Solidity 提供的一个内置库
* `abi.encode` 将多个值编码为字节数组
* `abi.encodePacked` 将多个值编码为紧凑的字节数组，不会进行对齐或填充
* `abi.encodeWithSelector` 将函数选择器（4 字节）和参数编码为字节数组。通常用于调用合约的函数
* `abi.encodeWithSignature` 将函数签名（字符串形式）和参数编码为字节数组。编译器会自动解析函数签名并生成选择器
* `abi.decode` 将字节数组解码为指定类型的变量。解码时需要指定解码的类型
* `abi.encodeCall` 将函数调用编码为字节数组。这个方法在 Solidity 0.8.12 及以上版本中可用，用于更方便地编码函数调用
* `abi.selector` 获取函数选择器（4 字节）。这个方法在 Solidity 0.8.12 及以上版本中可用
* `abi.functionSelector` 获取函数选择器（4 字节）。这个方法在 Solidity 0.8.12 及以上版本中可用，与 `abi.selector` 类似

### 编译器优化
在 Solidity 编译过程中，**优化（Optimization）** 是一个重要的选项，它可以帮助优化生成的字节码（bytecode），从而减少部署和执行时的 gas 消耗。启用优化通常会对编译器生成的代码进行一系列的改进，以提高效率。

*Optimization Enabled: Yes with 200 runs*

```bash
solc --optimize --optimize-runs 200 your_contract.sol
```

### Uniswap tokenURI
tokenURI 是实时生成的数据，将 positions 数据包装成一个 json data base64 返回。解析时会专门特殊处理 WETH9。

### Base64

Base64 是将字符转为 8 个 `0/1`，在组装为 6 个 `0/1` 映射出 Ascii字符，长度为 4的倍数，结尾用 `=` 补充。

### 父类初始化
```ts
constructor([参数列表]) [父合约构造函数调用] {
    // 初始化逻辑
}

constructor(
    address _factory,
    address _WETH9,
    address _tokenDescriptor_
) ERC721Permit('Uniswap V3 Positions NFT-V1', 'UNI-V3-POS', '1') PeripheryImmutableState(_factory, _WETH9) {
    _tokenDescriptor = _tokenDescriptor_;
}
```

### 修饰符
```ts
function collect(CollectParams calldata params)
    external
    payable
    override
    isAuthorizedForToken(params.tokenId)
    returns (uint256 amount0, uint256 amount1)
{
    // ...
}

modifier isAuthorizedForToken(uint256 tokenId) {
    require(_isApprovedOrOwner(msg.sender, tokenId), 'Not approved');
    _;
}

modifier myModifier() {
    // 在函数执行之前执行的逻辑
    _; // 表示函数的主体逻辑
    // 在函数执行之后执行的逻辑
}
```
在 Solidity 中，`isAuthorizedForToken` 是一个**修饰符（modifier）** ，它用于在函数执行之前或之后执行一些额外的逻辑。修饰符通常用于实现权限检查、状态验证或其他前置条件。
