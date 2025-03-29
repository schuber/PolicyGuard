const axios = require('axios');
const { parse } = require('node-html-parser');
const logger = require('../utils/logger');

/**
 * 从URL获取隐私政策内容
 * @param {string} url - 隐私政策URL
 * @returns {Promise<string>} 返回获取的文本内容
 */
exports.fetchPolicyFromUrl = async (url) => {
  try {
    // 验证URL格式
    if (!url.match(/^https?:\/\/.+/i)) {
      throw new Error('无效的URL格式，请确保URL以http://或https://开头');
    }

    logger.info(`正在获取URL内容: ${url}`);
    
    // 设置请求头模拟浏览器
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    };

    // 获取URL内容
    const response = await axios.get(url, {
      headers,
      timeout: 15000, // 15秒超时
      maxContentLength: 5 * 1024 * 1024, // 限制响应大小为5MB
    });

    // 解析HTML
    const html = response.data;
    const root = parse(html);

    // 移除脚本、样式和注释等干扰内容
    root.querySelectorAll('script, style, noscript, svg, img, iframe, [aria-hidden="true"]').forEach(el => el.remove());

    // 尝试定位隐私政策内容
    // 常见的隐私政策容器选择器
    const policySelectors = [
      'main', 
      '#privacy-policy', 
      '.privacy-policy',
      '.privacy', 
      '#privacy',
      'article', 
      '.article', 
      '.content', 
      '#content',
      '.container',
      '.legal',
      '#legal'
    ];

    let contentElement = null;

    // 尝试选择最可能包含隐私政策的容器
    for (const selector of policySelectors) {
      const element = root.querySelector(selector);
      if (element && element.textContent.trim().length > 1000) {
        contentElement = element;
        logger.info(`找到隐私政策内容容器: ${selector}`);
        break;
      }
    }

    // 如果没有找到特定容器，就使用body
    if (!contentElement) {
      contentElement = root.querySelector('body');
      logger.info('使用body作为内容容器');
    }

    // 提取文本并清理
    let text = contentElement.textContent
      .replace(/\s+/g, ' ')           // 规范化空白
      .replace(/\s+([.,;:])/g, '$1')  // 移除标点前的空格
      .trim();
    
    // 如果内容太短，可能是误判，尝试使用整个body
    if (text.length < 1000 && contentElement !== root.querySelector('body')) {
      logger.warn('所选容器内容过短，尝试使用整个body');
      text = root.querySelector('body').textContent
        .replace(/\s+/g, ' ')
        .replace(/\s+([.,;:])/g, '$1')
        .trim();
    }

    logger.info(`成功获取隐私政策内容，长度: ${text.length} 字符`);
    return text;
  } catch (error) {
    logger.error(`获取URL内容失败: ${error.message}`);
    throw new Error(`无法获取URL内容: ${error.message}`);
  }
}; 