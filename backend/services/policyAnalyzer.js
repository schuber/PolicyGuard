const logger = require('../utils/logger');
const aiService = require('./aiService');
const { policyAnalysisPrompt } = require('../models/prompts');

/**
 * 分析隐私政策文本
 * @param {string} policyText - 隐私政策文本内容
 * @returns {Promise<Object>} 分析结果
 */
exports.analyze = async (policyText) => {
  try {
    logger.info('开始分析隐私政策...');
    
    // 确保文本处于合理长度范围内
    if (policyText.length > 20000) {
      logger.warn(`政策文本过长 (${policyText.length} 字符)，将被截断`);
      policyText = policyText.substring(0, 20000);
    }

    // 调用AI服务，传入分析提示和政策文本
    const analyzePrompt = policyAnalysisPrompt.replace('{{POLICY_TEXT}}', policyText);
    const aiResponse = await aiService.getAIResponse(analyzePrompt);
    
    // 解析AI响应为JSON
    let analysisResult;
    try {
      // 尝试解析整个响应
      analysisResult = JSON.parse(aiResponse);
      logger.info('成功解析AI响应为JSON');
    } catch (parseError) {
      logger.warn('无法将整个响应解析为JSON，尝试提取JSON部分...');
      try {
        // 提取可能被包裹在其他文本中的JSON部分
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
          logger.info('成功从响应中提取并解析JSON');
        } else {
          throw new Error('响应中未找到有效的JSON');
        }
      } catch (extractError) {
        logger.error('从AI响应中提取JSON失败', extractError);
        throw new Error('无法解析AI响应');
      }
    }

    // 验证分析结果的结构
    if (!analysisResult || 
        !analysisResult.dataCollection || 
        !analysisResult.dataUsage || 
        !analysisResult.dataSharing || 
        !analysisResult.dataProtection || 
        !analysisResult.userRights || 
        !analysisResult.risks) {
      logger.error('AI响应缺少必要的字段');
      throw new Error('AI分析结果格式不正确');
    }

    // 将结果中的Markdown转换为HTML (如果需要)
    // 在前端进行此转换，保持后端返回纯文本

    logger.info('隐私政策分析完成');
    
    return {
      dataCollection: analysisResult.dataCollection,
      dataUsage: analysisResult.dataUsage,
      dataSharing: analysisResult.dataSharing,
      dataProtection: analysisResult.dataProtection,
      userRights: analysisResult.userRights,
      risks: analysisResult.risks || [],
      riskSegments: analysisResult.riskSegments || [],
      summary: analysisResult.summary || ''
    };
  } catch (error) {
    logger.error(`隐私政策分析错误: ${error.message}`);
    throw new Error(`分析过程中出错: ${error.message}`);
  }
}; 