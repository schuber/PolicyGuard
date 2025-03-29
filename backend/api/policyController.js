const logger = require('../utils/logger');
const policyAnalyzer = require('../services/policyAnalyzer');
const urlFetcher = require('../services/urlFetcher');

/**
 * 处理隐私政策分析请求
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
exports.analyzePolicy = async (req, res) => {
  try {
    const { text, url } = req.body;
    
    // 验证请求
    if (!text && !url) {
      return res.status(400).json({
        success: false,
        message: '请提供隐私政策文本或URL'
      });
    }

    let policyText = text;
    let source = 'text';

    // 如果提供了URL，则获取内容
    if (url) {
      logger.info(`从URL获取隐私政策: ${url}`);
      try {
        policyText = await urlFetcher.fetchPolicyFromUrl(url);
        source = 'url';
      } catch (error) {
        logger.error(`获取URL内容失败: ${error.message}`);
        return res.status(400).json({
          success: false,
          message: `无法从URL获取内容: ${error.message}`
        });
      }
    }

    // 验证得到的文本
    if (!policyText || policyText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: '隐私政策文本过短或为空，请提供完整的隐私政策内容'
      });
    }

    // 处理文本过长的情况
    const maxCharCount = 20000; // 设置最大字符数限制
    if (policyText.length > maxCharCount) {
      logger.warn(`政策文本已被截断，原长度: ${policyText.length} 字符`);
      policyText = policyText.substring(0, maxCharCount);
    }

    // 分析政策
    logger.info(`开始分析隐私政策 (${source})...`);
    const result = await policyAnalyzer.analyze(policyText);

    // 返回结果
    return res.json({
      success: true,
      source,
      ...result
    });
  } catch (error) {
    logger.error(`分析过程出错: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: '分析过程中出现错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 