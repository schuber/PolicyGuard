const express = require('express');
const router = express.Router();
const policyController = require('./policyController');

/**
 * @route POST /api/analyze
 * @description 分析隐私政策文本或从URL获取并分析
 * @body {text} 隐私政策文本内容 -或- {url} 隐私政策URL
 * @returns {Object} 分析结果
 */
router.post('/analyze', policyController.analyzePolicy);

/**
 * @route GET /api/status
 * @description 服务状态检查
 * @returns {Object} 服务状态信息
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'PolicyGuard API'
  });
});

module.exports = router; 