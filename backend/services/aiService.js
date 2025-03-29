const { OpenAI } = require('openai');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // 从环境变量获取API密钥
});

// 缓存目录
const CACHE_DIR = path.join(__dirname, '../data/cache');

// 确保缓存目录存在
if (!fs.existsSync(CACHE_DIR)) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    logger.info('缓存目录已创建');
  } catch (error) {
    logger.error('创建缓存目录失败:', error);
  }
}

/**
 * 从AI模型获取响应
 * @param {string} prompt - 提示文本
 * @returns {Promise<string>} AI响应文本
 */
exports.getAIResponse = async (prompt) => {
  try {
    // 生成缓存键（基于提示的哈希值）
    const cacheKey = Buffer.from(prompt).toString('base64').substring(0, 32);
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);

    // 检查缓存
    if (process.env.USE_CACHE === 'true' && fs.existsSync(cachePath)) {
      try {
        const cachedResponse = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        logger.info('使用缓存的AI响应');
        return cachedResponse.response;
      } catch (cacheError) {
        logger.warn('读取缓存失败，将请求新响应:', cacheError.message);
      }
    }

    // 确定使用的模型
    const modelName = process.env.AI_MODEL || 'gpt-4';
    logger.info(`使用AI模型: ${modelName}`);

    // 调用OpenAI API
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: '你是一个专业的隐私政策分析助手，你的任务是分析隐私政策并以JSON格式返回结构化信息。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2, // 低温度，提高一致性
      max_tokens: 4000 // 足够的响应长度
    });

    // 提取并处理响应文本
    const responseText = response.choices[0].message.content.trim();

    // 缓存响应
    if (process.env.USE_CACHE === 'true') {
      try {
        fs.writeFileSync(cachePath, JSON.stringify({
          timestamp: new Date().toISOString(),
          prompt: prompt.substring(0, 100) + '...',
          response: responseText
        }));
        logger.info('AI响应已缓存');
      } catch (cacheError) {
        logger.warn('缓存AI响应失败:', cacheError.message);
      }
    }

    return responseText;
  } catch (error) {
    logger.error('AI API调用失败:', error);
    throw new Error(`AI服务调用失败: ${error.message}`);
  }
};

/**
 * 获取可用的AI模型列表
 * 这个功能可以用于让管理员在面板中选择不同的模型
 * @returns {Promise<Array<string>>} 模型列表
 */
exports.getAvailableModels = async () => {
  try {
    // 尝试从API获取最新模型列表
    const models = await openai.models.list();
    return models.data.map(model => model.id);
  } catch (error) {
    logger.error('获取模型列表失败:', error);
    
    // 如果API调用失败，返回默认模型列表
    return [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k'
    ];
  }
}; 