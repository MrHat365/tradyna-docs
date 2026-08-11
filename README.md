# Tradyna 用户手册

面向终端用户的操作文档（VitePress）。不含部署与开发内容。

独立仓库：[MrHat365/tradyna-docs](https://github.com/MrHat365/tradyna-docs)  
线上（GitHub Pages）：https://mrhat365.github.io/tradyna-docs/

## 本地预览

```bash
npm install
npm run docs:dev
```

浏览器打开终端打印的地址，默认：**http://127.0.0.1:5173/**

构建与本地预览静态站：

```bash
npm run docs:build
npm run docs:preview   # http://127.0.0.1:4173/
```

## 线上发布

推送到 `main` 后由 GitHub Actions 自动 `npm ci` → `docs:build` → 部署到 GitHub Pages（`base: /tradyna-docs/`）。也可在 Actions 里手动 `workflow_dispatch`。

## 截图（可选）

需本机终端已在跑（例如 DOM 仓库根目录 `bun run start`，默认 `:3000`）：

```bash
npm run screenshots
```

产物写入 `docs/public/screenshots/`。截图脚本会打码令牌输入框。

## 信息架构

- 快速开始
- 登录与界面导览
- DOM 交易终端
- 账户与权限
- 经典网格
- 高级网格
- 控制台
- 常见问题
