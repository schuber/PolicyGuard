const { OpenAI } = require('openai');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// 检查必需的环境变量
const checkRequiredEnvVars = () => {
  const aiModelType = process.env.AI_MODEL_TYPE || 'openai';
  
  if (aiModelType === 'openai' && !process.env.OPENAI_API_KEY) {
    logger.error('未设置OpenAI API密钥。请在Vercel环境变量中设置OPENAI_API_KEY。');
    return false;
  } else if (aiModelType === 'claude' && !process.env.ANTHROPIC_API_KEY) {
    logger.error('未设置Anthropic API密钥。请在Vercel环境变量中设置ANTHROPIC_API_KEY。');
    return false;
  } else if (aiModelType === 'mistral' && !process.env.MISTRAL_API_KEY) {
    logger.error('未设置Mistral API密钥。请在Vercel环境变量中设置MISTRAL_API_KEY。');
    return false;
  }
  
  return true;
};

// 初始化OpenAI客户端
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // 从环境变量获取API密钥
  });
  logger.info('OpenAI客户端初始化成功');
} catch (error) {
  logger.error('OpenAI客户端初始化失败:', error);
}

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
  if (!checkRequiredEnvVars()) {
    throw new Error('环境变量配置错误。请检查Vercel环境变量设置。');
  }

  try {
    // 记录环境信息
    logger.info(`当前环境: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`AI模型类型: ${process.env.AI_MODEL_TYPE || 'openai'}`);
    
    // 生成缓存键（基于提示的哈希值）
    const cacheKey = Buffer.from(prompt).toString('base64').substring(0, 32);
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);

    // 检查缓存
    const useCache = process.env.USE_CACHE === 'true';
    if (useCache && fs.existsSync(cachePath)) {
      try {
        const cachedResponse = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        logger.info('使用缓存的AI响应');
        return cachedResponse.response;
      } catch (cacheError) {
        logger.warn('读取缓存失败，将请求新响应:', cacheError.message);
      }
    }

    // 确定使用的模型和类型
    const aiModelType = process.env.AI_MODEL_TYPE || 'openai';
    const modelName = process.env.AI_MODEL || (aiModelType === 'openai' ? 'gpt-4' : 'claude-2');
    logger.info(`使用AI模型: ${modelName} (${aiModelType})`);

    let responseText;
    
    // 根据不同的AI服务提供商选择不同的API调用方式
    if (aiModelType === 'openai') {
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
      responseText = response.choices[0].message.content.trim();
    } else if (aiModelType === 'claude') {
      // Claude API调用逻辑（示例，需要根据实际情况修改）
      // 这里仅为示例，您需要根据Claude API文档实现实际调用
      logger.info('使用Claude API（该功能需要完整实现）');
      throw new Error('Claude API集成尚未完全实现。请在Vercel环境变量中设置AI_MODEL_TYPE为openai。');
    } else if (aiModelType === 'mistral') {
      // Mistral API调用逻辑（示例，需要根据实际情况修改）
      // 这里仅为示例，您需要根据Mistral API文档实现实际调用
      logger.info('使用Mistral API（该功能需要完整实现）');
      throw new Error('Mistral API集成尚未完全实现。请在Vercel环境变量中设置AI_MODEL_TYPE为openai。');
    } else {
      throw new Error(`不支持的AI模型类型: ${aiModelType}`);
    }

    // 缓存响应
    if (useCache) {
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
  if (!process.env.OPENAI_API_KEY) {
    logger.warn('未设置OpenAI API密钥，无法获取模型列表');
    return getDefaultModels();
  }
  
  try {
    // 尝试从API获取最新模型列表
    const models = await openai.models.list();
    return models.data.map(model => model.id);
  } catch (error) {
    logger.error('获取模型列表失败:', error);
    return getDefaultModels();
  }
};

// 获取默认模型列表
function getDefaultModels() {
  const aiModelType = process.env.AI_MODEL_TYPE || 'openai';
  
  if (aiModelType === 'openai') {
    return [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k'
    ];
  } else if (aiModelType === 'claude') {
    return [
      'claude-2',
      'claude-instant-1'
    ];
  } else if (aiModelType === 'mistral') {
    return [
      'mistral-small',
      'mistral-medium',
      'mistral-large'
    ];
  }
  
  return ['未知模型'];
} 