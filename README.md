# surviveJPSH

上海市建平中学生存手册

## 项目介绍

本项目旨在为建平中学新生提供一份实用的校园生存指南，涵盖学习和生活两个方面。

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

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 构建与部署

### Cloudflare Workers

```bash
npm run build
npx wrangler deploy
```

### GitHub Pages

项目已配置 GitHub Actions，推送到 `main` 分支后会自动部署到 GitHub Pages。

## 内容

- **学习篇**: 选科、学习资源、身心状态、学习策略
- **生活篇**: 老师、规则、朋友、恋爱、家长、活动、建议等

## 许可证

本项目内容采用 CC BY-SA 4.0 许可证。

UI 组件库 WinUI on Web 采用 GPL-3.0 许可证。
