# Vercel 部署说明

## 部署步骤

1. **准备代码**
   - 确保 `frontend/abi/` 目录中的 ABI 文件已提交到 Git
   - 这些文件在 Vercel 构建时会使用

2. **在 Vercel 上创建项目**
   - 登录 [Vercel](https://vercel.com)
   - 点击 "New Project"
   - 导入你的 Git 仓库
   - **重要**: 设置 Root Directory 为 `frontend`

3. **环境变量（可选）**
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: WalletConnect 项目 ID（如果需要）

4. **构建配置**
   - Framework Preset: Next.js
   - Build Command: `npm run build` (自动)
   - Output Directory: `.next` (自动)
   - Install Command: `npm install` (自动)

5. **部署**
   - 点击 "Deploy"
   - Vercel 会自动检测 Next.js 项目并开始构建

## 注意事项

- ABI 文件必须在 Git 中，因为 Vercel 构建时不会运行 Hardhat 部署
- 合约地址在 `frontend/abi/EncryptedOneTimeCodeAddresses.ts` 中已配置
- 如果需要在 Vercel 上更新合约地址，需要：
  1. 本地运行 `npm run genabi` 更新地址文件
  2. 提交更新的文件到 Git
  3. Vercel 会自动重新部署

## 当前合约地址

- **Sepolia**: `0x366c764f97c7D7b1Acf20786362211D040B88E1f`
- **Localhost**: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`

