# OS5 Notes Interactive Prototype

从 `https://os5-notes-demo.yanglilian703.chatgpt.site` 迁入的独立静态版本，后续直接在 GitHub Demo Hub 中维护，不再依赖 ChatGPT Sites 运行时或登录权限。

## 本地预览

在仓库根目录运行：

```bash
python3 -m http.server 4175
```

然后打开：

```text
http://127.0.0.1:4175/demos/os5-notes-interactive-prototype/
```

## 文件结构

- `index.html`：页面外壳与七个场景导航
- `style.css`：基础、笔记与合集样式
- `details.css`：课程、待办、想法、访谈与卡证样式
- `interaction.css`：弹层、表单、问答与交互状态样式
- `icons.js`：内联 SVG 图标
- `data.js`：演示数据与本地状态
- `app.js`：页面渲染
- `interactions.js`：业务交互
- `events.js`：事件分发与页面初始化
- `reference/`：七张原型对照图
- `source-manifest.json`：迁移来源、文件大小与 SHA-256

## 运行边界

- 纯静态 HTML / CSS / JavaScript，无构建步骤、无私有后端。
- 新增笔记、待办和学习状态保存在当前浏览器 `localStorage`。
- AI 回答、语音写入、系统提醒和卡证数据均为演示。
- ChatGPT Sites 注入的登录、Cloudflare challenge 与状态页脚本已移除。

## 修改与发布

直接修改本目录源文件，提交到 Demo Hub 后由根目录 GitHub Pages 工作流发布。正式线上入口：

```text
https://ylilian777333-rgb.github.io/ai-notes-demo-hub/demos/os5-notes-interactive-prototype/
```
