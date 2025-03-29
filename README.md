# PolicyGuard - 隐私政策分析工具

PolicyGuard是一个基于AI的隐私政策分析工具，帮助用户快速理解复杂的隐私条款，识别潜在风险，保护个人数据安全。

![PolicyGuard Screenshot](screenshot.png)

## 项目特点

- **即时分析**：用户可以通过粘贴文本或输入URL直接分析隐私政策
- **结构化摘要**：自动提取数据收集、使用、共享等关键信息
- **风险评估**：识别并高亮显示潜在的隐私风险条款，并按严重程度分级
- **直观界面**：清晰的响应式布局，适配桌面和移动设备
- **深色模式**：支持浅色/深色主题切换，减轻阅读疲劳
- **隐私保护**：所有分析在服务器端完成，无需用户提供API密钥

## 技术栈

### 前端
- **HTML5 + Tailwind CSS**：构建现代、响应式的用户界面
- **Alpine.js**：轻量级JavaScript框架，提供交互功能
- **Axios**：处理API请求
- **Vite**：快速的前端构建工具

### 后端
- **Node.js + Express**：构建API服务器
- **OpenAI API**：提供AI分析能力（支持替换为Claude或Mistral）
- **Winston**：日志记录
- **Node-HTML-Parser**：处理URL内容提取

## 安装与使用

### 前提条件
- Node.js (v14+)
- 有效的OpenAI API密钥或其他支持的AI服务密钥

### 本地安装

1. 克隆代码库:
```bash
git clone https://github.com/yourusername/policyguard.git
cd policyguard
```

2. 安装依赖:
```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

3. 配置环境变量:
```bash
# 在backend目录下
cp .env.example .env
# 编辑.env文件，填入你的API密钥和其他配置
```

4. 启动开发服务器:
```bash
# 启动前端开发服务器
cd frontend
npm run dev

# 启动后端服务器
cd ../backend
npm run dev
```

5. 访问应用:
浏览器打开 `http://localhost:3000`

### 生产环境部署

1. 构建前端:
```bash
cd frontend
npm run build
```

2. 配置后端:
```bash
cd ../backend
# 确保.env中NODE_ENV=production
```

3. 启动服务:
```bash
npm start
```

4. 使用Nginx或其他Web服务器进行代理配置（可选）

## AI模型配置

PolicyGuard设计为支持多种AI服务提供商。目前支持:

1. **OpenAI (默认)**
   - 在`.env`文件中设置`OPENAI_API_KEY`
   - 可以通过`AI_MODEL`设置使用的模型（如gpt-4, gpt-3.5-turbo）

2. **Anthropic Claude**
   - 设置`AI_MODEL_TYPE=claude`
   - 提供`ANTHROPIC_API_KEY`

3. **Mistral AI**
   - 设置`AI_MODEL_TYPE=mistral`
   - 提供`MISTRAL_API_KEY`

### 更换AI提供商
编辑`.env`文件中的相关配置：
```
AI_MODEL_TYPE=openai  # 改为claude或mistral
AI_MODEL=gpt-4        # 如使用OpenAI，可指定模型
```

## 贡献指南

欢迎对PolicyGuard做出贡献!

1. Fork代码库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交Pull Request

## 授权协议

本项目采用MIT授权协议 - 详见 [LICENSE](LICENSE) 文件

## 免责声明

PolicyGuard提供的分析仅供参考，不构成法律建议。用户在做出隐私相关决定时，应当咨询专业法律人士。 