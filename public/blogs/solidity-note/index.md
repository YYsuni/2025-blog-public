
### 使用 Hardhat

```bash
npx hardhat init
// 注意用 npm 源 + proxy
```

安装 vscode solidity 插件

### 安装依赖

```bash
pnpm i hardhat ethers @nomicfoundation/hardhat-chai-matchers @nomicfoundation/hardhat-ignition @nomicfoundation/hardhat-toolbox
```

### 直接编译

```bash
npx hardhat compile

// npm script
"compile": "hardhat compile",
```

### 部署到 testnet

1. 添加 network 到 `hardhat.config.ts`

```ts
networks: {
    testnet: {
      url: `<rpc>`,
      accounts: [
        "<private key>",
      ],
    },
},
```

2. 添加 deploy script

```
"deploy": "hardhat ignition deploy ./ignition/modules/Lock.ts --network testnet"
```

运行 `npm run deploy`

### 验证合约

1. 添加 sourcify 到 `hardhat.config.ts`

```json
sourcify: {
    enabled: true,
    apiUrl: "...",
    browserUrl: "...",
},
etherscan: {
    enabled: false,
    // apiKey: "..."
}
```

2. 验证命令

```bash
npx hardhat verify  --network testnet  0x...

// npm script
 "verify": "hardhat verify --network testnet 0x..."
```

如果多次部署同一个合约，需要设置具体文件

```bash
 "verify": "hardhat verify --network testnet --contract contracts/xxx.sol:xxx 0x..."
```

### 更新代码

> solidity 代码不可直接升级，升级只能通过预先设计 proxy

更新代码 => 编译 => 写部署文件 .ts => 更新+运行部署 script

新增部署 ts 文件

```ts
import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const Test01Module = buildModule('<any-module-name>', m => {
	const contract = m.contract('<contract-name>', [])
	// const contract2 = m.contract("<contract-name-2>", []);

	return { contract }
})

export default Test01Module
```