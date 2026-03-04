# Figma Plugin 安装指南

## 步骤 1: 在 Figma Desktop 中加载插件

1. 打开 Figma Desktop 应用
2. 点击菜单 **Plugins** → **Development** → **Import plugin from manifest...**
3. 选择文件：`/root/.openclaw/workspace/projects/code-to-figma/figma-plugin/manifest.json`
4. 插件将显示为 "OKScale to Figma"

## 步骤 2: 配置 Notion Token

插件需要 Notion API Token 才能读取数据。

### 获取 Notion Token
1. 访问 https://www.notion.so/my-integrations
2. 创建新的 Integration
3. 复制 "Internal Integration Token"
4. 在 Notion 中，打开 Figma Import Queue database
5. 点击右上角 "..." → "Add connections" → 选择你的 Integration

### 在插件中设置 Token
目前插件使用 `figma.clientStorage` 存储 token。首次运行时需要通过代码设置：

```typescript
// 在 Figma 插件控制台中运行
await figma.clientStorage.setAsync('notionToken', 'YOUR_NOTION_TOKEN_HERE');
```

或者我们可以在 UI 中添加设置界面。

## 步骤 3: 使用插件

1. 运行 `npm run push-to-figma` 推送数据到 Notion
2. 复制输出的 Page ID（格式：`31966d37-e695-81f2-962d-df4d66986218`）
3. 在 Figma 中运行插件：**Plugins** → **Development** → **OKScale to Figma**
4. 粘贴 Page ID
5. 点击 "Import from Notion"

## 当前状态

✅ **已完成**：
- Figma Plugin 基础架构
- Notion API 集成
- DOM → Figma 节点转换
- 样式解析（颜色、边框、圆角）
- UI 界面

⚠️ **待优化**：
- Token 配置流程（考虑添加设置界面）
- 布局算法（当前是简单垂直堆叠）
- 更多 CSS 属性支持
- 错误处理和重试逻辑

## 下一步

建议测试完整流程：
1. 捕获 OKScale 实际页面
2. 推送到 Notion
3. 在 Figma 中导入
4. 根据结果优化转换逻辑
