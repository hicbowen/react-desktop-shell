# react-app-rail

一个轻量的 React/Vite 前端壳模板，适合作为 Wails 工具类应用的起点。它提供原生应用风格标题栏、侧边导航、内容区布局、暗色模式和窗口控制适配层。

## 最小改动入口

新建工具应用时，通常只需要改这些位置：

- `src/app.config.ts`：应用名、图标、默认页面、侧边栏菜单、页脚菜单、页面映射。
- `src/pages/*`：替换或新增实际页面内容。
- `src/platform/windowControls.ts`：接入 Wails runtime 的最小化、最大化/还原、关闭窗口 API。
- `src/App.css`：通过顶部 CSS 变量调整尺寸、颜色、边框和主题色。

## 新增页面

1. 在 `src/pages` 下创建页面组件。
2. 在 `src/app.config.ts` 的 `RouteId` 中新增页面 ID。
3. 将页面加入 `routeComponents`。
4. 在 `navItems` 或 `footerItems` 中加入对应菜单项。

模板使用配置驱动的内存路由，不依赖 React Router，方便桌面工具应用保持轻量。

## Wails 窗口按钮

`src/platform/windowControls.ts` 默认是浏览器/Vite 环境下安全的 no-op。接入 Wails 时，只需要把这里的三个方法替换成 Wails runtime 调用：

- `minimizeWindow`
- `toggleMaximizeWindow`
- `closeWindow`

其他组件不需要知道具体运行环境。

## Scripts

```bash
npm run dev
npm run build
npm run lint
```
