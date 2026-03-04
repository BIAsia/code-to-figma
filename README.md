# Code to Figma - OKScale 设计稿自动推送

## 项目目标

实现从 OKScale web 应用自动捕获 UI 并推送到 Figma 的完整管道。

## 技术方案

**架构**：Puppeteer + Notion + Figma Plugin

```
指令 → Puppeteer 捕获 DOM → 上传到 Notion → Figma Plugin 读取 → 创建节点
```

## 核心组件

1. **Puppeteer 捕获脚本** (`scripts/capture.ts`)
   - 访问 OKScale 页面
   - 执行 DOM 捕获
   - 提取样式和布局信息

2. **Notion 存储** (`scripts/upload-notion.ts`)
   - 上传 JSON 数据到 Notion Database
   - 支持分块存储（>2000 字符）
   - 状态管理（Ready/Imported/Failed）

3. **Figma Plugin** (`figma-plugin/`)
   - 从 Notion 读取数据
   - 创建 Figma 节点树
   - OKScale 特定优化（渐变、色彩）

## 实现阶段

### Phase 1: Notion 集成 ✅
- [x] 创建 Notion Database
- [ ] 实现上传脚本
- [ ] 测试数据存储

### Phase 2: Puppeteer 捕获
- [ ] 集成 html-figma/browser
- [ ] 测试 OKScale 页面捕获
- [ ] 处理动态内容

### Phase 3: Figma Plugin
- [ ] 插件骨架
- [ ] Notion 数据读取
- [ ] 节点创建逻辑

### Phase 4: 端到端测试
- [ ] 完整流程测试
- [ ] 错误处理
- [ ] 文档

## 使用方式（目标）

```bash
# 一键推送
npm run push-to-figma

# 输出
✅ 数据已上传到 Notion: https://notion.so/xxx
📋 Page ID: xxx-xxx-xxx
💡 请在 Figma 中运行 "OKScale to Figma" 插件
```

## 技术栈

- **Puppeteer**: 无头浏览器，DOM 捕获
- **html-figma**: DOM → Figma 节点转换
- **@notionhq/client**: Notion API
- **Figma Plugin API**: 节点创建

## 目录结构

```
projects/code-to-figma/
├── README.md                 # 本文件
├── PROGRESS.md              # 进度日志
├── scripts/
│   ├── capture.ts           # Puppeteer 捕获
│   ├── upload-notion.ts     # Notion 上传
│   └── push-to-figma.ts     # 一键脚本
├── figma-plugin/
│   ├── manifest.json
│   ├── code.ts              # 插件主逻辑
│   └── ui.html              # 插件 UI
└── package.json
```

## 配置

需要的环境变量：
- `NOTION_TOKEN`: Notion Integration Token
- `FIGMA_IMPORT_DB_ID`: Notion Database ID
- `FIGMA_ACCESS_TOKEN`: Figma Personal Access Token（插件用）

## 参考资料

- [html-figma GitHub](https://github.com/sergcen/html-to-figma)
- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [Notion API](https://developers.notion.com/)
