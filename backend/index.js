require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./utils/logger');
const apiRoutes = require('./api/routes');

// 记录环境变量信息
const logEnvInfo = () => {
  logger.info('=== 环境配置信息 ===');
  logger.info(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`PORT: ${process.env.PORT || 5000}`);
  logger.info(`AI_MODEL_TYPE: ${process.env.AI_MODEL_TYPE || 'openai'}`);
  logger.info(`AI_MODEL: ${process.env.AI_MODEL || 'gpt-4'}`);
  logger.info(`USE_CACHE: ${process.env.USE_CACHE || 'true'}`);
  logger.info(`LOG_LEVEL: ${process.env.LOG_LEVEL || 'info'}`);
  
  // 检查必需的环境变量
  const aiModelType = process.env.AI_MODEL_TYPE || 'openai';
  if (aiModelType === 'openai') {
    logger.info(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '已设置' : '未设置'}`);
  } else if (aiModelType === 'claude') {
    logger.info(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '已设置' : '未设置'}`);
  } else if (aiModelType === 'mistral') {
    logger.info(`MISTRAL_API_KEY: ${process.env.MISTRAL_API_KEY ? '已设置' : '未设置'}`);
  }
  
  logger.info('=====================');
};

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 5000;

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 记录请求信息的中间件
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// API路由
app.use('/api', apiRoutes);

// 生产环境提供前端静态文件
if (process.env.NODE_ENV === 'production') {
  const staticPath = process.env.FRONTEND_BUILD_PATH 
    ? path.resolve(__dirname, process.env.FRONTEND_BUILD_PATH) 
    : path.join(__dirname, '../frontend/dist');
  
  logger.info(`提供静态文件，路径: ${staticPath}`);
  app.use(express.static(staticPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error(`服务错误: ${err.message}`);
  logger.error(err.stack);
  
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(PORT, () => {
  logger.info(`服务已启动，端口: ${PORT}`);
  logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`服务器时间: ${new Date().toISOString()}`);
  
  // 记录环境变量信息
  logEnvInfo();
}); 