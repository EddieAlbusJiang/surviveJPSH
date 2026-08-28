# surviveJPSH 
**上海市建平中学生存手册**


## 项目介绍

本项目旨在为建平中学学生提供一份实用的校园生存经验指南，涵盖学习、生活、思维等多个方面。

## 访问
三个线路的内容一致，请自行选择加载最快的线路
- **Github Pages**: [https://eddiealbusjiang.github.io/surviveJPSH](https://eddiealbusjiang.github.io/surviveJPSH)
- **Cloudflare #1**: [https://survivejpsh.eternal-starfield.cn](https://survivejpsh.eternal-starfield.cn)
- **Cloudflare #2**: [https://survivejpsh.eddiealbusjiang.workers.dev](https://survivejpsh.eddiealbusjiang.workers.dev)

## 内容

- **学习篇**: 选科、学习资源、身心状态、学习策略
- **生活篇**: 老师、规则、朋友、恋爱、家长、活动、建议等

## 技术栈

- **前端框架**: Vue 3.5 + TypeScript
- **构建工具**: Vite 8
- **UI 组件库**: WinUI on Web
- **路由**: Vue Router 4
- **Markdown 渲染**: markdown-it

## 项目结构

```
surviveJPSH/
├── src/
│   ├── main.ts              # 应用入口
│   ├── App.vue              # 主布局
│   ├── router.ts            # 路由配置
│   ├── styles/              # 样式文件
│   ├── components/          # WinUI 组件
│   ├── views/               # 页面组件
│   ├── docs/                # Markdown 文档
│   └── utils/               # 工具函数
├── raw/                     # 原始文档
├── .github/workflows/       # GitHub Actions
└── wrangler.jsonc           # Cloudflare Workers 配置
```

## 本地开发预览

```bash
npm install
npm run dev
```

## 构建与部署

### Cloudflare Workers（须等待管理员操作）

```bash
npm run build
npx wrangler deploy
```

### GitHub Pages （所有Collaborators均可操作）

项目已配置 GitHub Actions，更新合并到 `main` 分支后会自动部署到 GitHub Pages。

## 版本
- **v0.1.0**: 初代demo，最简易的界面，传统html5。
  `Commit ID: 2f871a77669689fbc1c9f6bb0bb2e7b6e24fad67`
- **v0.2.0**: 引入Vue, WinUIonWeb，更现代的界面；启用Github Pages。
  `Commit ID: ac407e7845c6a4fafd7d737aece6f1700c5c6117`
- **v0.2.1**: 为文档浏览界面引入导航边栏。
- **v0.3.0**: 引入文档注册表；主题功能修复、UI优化。


## 许可证

本项目内容采用 CC BY-SA 4.0 许可证。

UI 组件库 [WinUI on Web](https://github.com/Furry-Xiyi/WinUIonWeb) 采用 GPL-3.0 许可证。
