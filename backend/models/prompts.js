/**
 * 隐私政策分析提示模板
 * 这个提示指导AI模型如何分析隐私政策文本并生成结构化响应
 */
exports.policyAnalysisPrompt = `
你是一位专业的隐私政策分析师。请分析以下隐私政策，并提供结构化分析结果。
专注于提取与用户数据相关的关键信息，包括数据收集、使用、共享和保护措施。
同时，识别出潜在的隐私风险和值得关注的条款。

以下是隐私政策全文：
----------------
{{POLICY_TEXT}}
----------------

请以JSON格式返回分析结果，包含以下字段：

1. dataCollection: 关于收集哪些数据、如何收集、是否获得用户同意的详细信息。列出主要数据类型和收集方式。
2. dataUsage: 说明数据如何被使用，包括功能性用途和商业用途（如广告、分析等）。
3. dataSharing: 数据与哪些第三方共享，出于什么目的，是否有选择退出的选项。
4. dataProtection: 采取了哪些安全措施保护用户数据，数据保留多长时间。
5. userRights: 用户对其数据拥有哪些权利（访问、删除、导出等）以及如何行使这些权利。
6. risks: 潜在隐私风险的数组，每项包含：
   - level: 风险级别（"high", "medium", "low"）
   - title: 风险标题（简短描述）
   - description: 详细风险说明
7. riskSegments: 原文中值得关注的风险条款位置和级别，数组格式：
   [
     {
       "level": "high"|"medium"|"low",
       "position": {"start": 数字, "end": 数字},
       "reason": "为什么这段文本是风险条款"
     }
   ]

确保分析内容全面、客观，使用简洁清晰的语言。分析中应关注以下方面：
- 信息收集范围是否过广？
- 数据使用目的是否明确？
- 与第三方共享条款是否过于宽泛？
- 用户对数据控制权如何？
- 是否有不明确或不合理的条款？

仅返回JSON对象，不要包含任何其他说明文字。每个字段的内容应当是详细且结构良好的文本，但不包含Markdown标记。`;

/**
 * 分析总结提示模板（可用于简化总结）
 */
exports.summarizeAnalysisPrompt = `
请基于以下隐私政策分析结果，生成一个简洁的总结，突出最重要的发现和主要风险点：

{{ANALYSIS_RESULT}}

总结应当包括：
1. 收集数据的范围和类型
2. 最主要的数据使用方式
3. 最值得关注的数据共享对象
4. 关键的风险点和问题（最多3个）
5. 总体评估（是否较为尊重用户隐私）

限制在200字以内。`;

/**
 * Claude分析提示模板
 * 如果切换到使用Anthropic Claude API，可以使用此提示
 */
exports.claudeAnalysisPrompt = `
<instructions>
你是一位专业的隐私政策分析师。请分析以下隐私政策，提供结构化分析结果。
你的返回必须是格式正确的JSON对象，不包含任何其他文本。
</instructions>

<privacy_policy>
{{POLICY_TEXT}}
</privacy_policy>

请以JSON格式返回分析结果，包含以下字段：

{
  "dataCollection": "关于收集哪些数据、如何收集、是否获得用户同意的详细信息",
  "dataUsage": "说明数据如何被使用，包括功能性用途和商业用途",
  "dataSharing": "数据与哪些第三方共享，出于什么目的，是否有选择退出的选项",
  "dataProtection": "采取了哪些安全措施保护用户数据，数据保留多长时间",
  "userRights": "用户对其数据拥有哪些权利以及如何行使这些权利",
  "risks": [
    {
      "level": "high|medium|low",
      "title": "风险标题",
      "description": "详细风险说明"
    }
  ],
  "riskSegments": [
    {
      "level": "high|medium|low",
      "position": {"start": 数字, "end": 数字},
      "reason": "为什么这段文本是风险条款"
    }
  ],
  "summary": "整体评估总结"
}`;

/**
 * 适用于Mistral模型的提示模板
 */
exports.mistralAnalysisPrompt = `
<task>
分析隐私政策文本，提取关键信息，识别风险点，并返回结构化JSON结果。
</task>

<privacy_policy>
{{POLICY_TEXT}}
</privacy_policy>

<output_format>
{
  "dataCollection": "详细数据收集情况",
  "dataUsage": "数据使用目的和方式",
  "dataSharing": "数据共享对象和方式",
  "dataProtection": "数据保护安全措施",
  "userRights": "用户权利和行使方式",
  "risks": [
    {
      "level": "high/medium/low",
      "title": "风险简述",
      "description": "详细描述"
    }
  ],
  "riskSegments": [
    {
      "level": "high/medium/low",
      "position": {"start": 数字位置, "end": 数字位置},
      "reason": "风险原因"
    }
  ]
}
</output_format>

只返回JSON，不要包含任何其他说明性文字。`;

/**
 * 通用风险评估标准
 * 用于提示中解释风险评级标准
 */
exports.riskAssessmentCriteria = `
风险等级评估标准:
- 高风险(high): 可能导致用户个人敏感数据未经明确同意被收集、过度共享或用于意料之外的目的。含有严重限制用户权利的条款。
- 中风险(medium): 数据处理行为模糊不清，用户选择退出困难，或共享条款范围较广但有一定限制。
- 低风险(low): 相对较小的隐私问题，如数据保留时间过长、次要数据收集等，但整体影响有限。`;

/**
 * 返回当前活动的分析提示模板
 * 根据环境变量中配置的AI模型类型选择合适的提示模板
 */
exports.getActivePrompt = () => {
  const modelType = process.env.AI_MODEL_TYPE?.toLowerCase() || 'openai';
  
  switch (modelType) {
    case 'claude':
      return exports.claudeAnalysisPrompt;
    case 'mistral':
      return exports.mistralAnalysisPrompt;
    case 'openai':
    default:
      return exports.policyAnalysisPrompt;
  }
}; 