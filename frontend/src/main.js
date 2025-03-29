import 'alpinejs';
import axios from 'axios';
import { marked } from 'marked';

// 检查是否存在深色模式存储并应用
if (localStorage.getItem('darkMode') === 'true' || 
    (!('darkMode' in localStorage) && 
     window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
}

// 定义 Alpine.js 组件
window.policyAnalyzer = function() {
  return {
    darkMode: localStorage.getItem('darkMode') === 'true' || 
              (!('darkMode' in localStorage) && 
               window.matchMedia('(prefers-color-scheme: dark)').matches),
    inputMode: 'text',
    policyText: '',
    policyUrl: '',
    analyzing: false,
    result: null,
    highlightedPolicy: '',
    error: null,

    // 切换深色模式
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem('darkMode', this.darkMode);
      
      if (this.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },

    // 分析隐私政策
    async analyzePolicy() {
      this.analyzing = true;
      this.error = null;

      try {
        // 根据输入模式准备请求数据
        const requestData = this.inputMode === 'text' 
          ? { text: this.policyText } 
          : { url: this.policyUrl };

        // 调用API进行分析
        const response = await axios.post('/api/analyze', requestData);
        this.result = response.data;
        
        // 高亮显示风险条款
        this.generateHighlightedPolicy();
      } catch (err) {
        console.error('分析失败:', err);
        this.error = err.response?.data?.message || '分析过程中出现错误，请重试';
      } finally {
        this.analyzing = false;
      }
    },

    // 重置分析状态
    resetAnalysis() {
      this.result = null;
      this.highlightedPolicy = '';
      this.error = null;
    },

    // 生成高亮显示的政策文本
    generateHighlightedPolicy() {
      if (!this.result || !this.result.riskSegments || this.inputMode !== 'text') {
        // 如果是URL模式或没有风险片段，直接显示原始文本
        this.highlightedPolicy = this.policyText;
        return;
      }

      let highlightedText = this.policyText;
      let offset = 0;

      // 按位置排序风险段落，从后往前替换以避免位置偏移问题
      const sortedSegments = [...this.result.riskSegments].sort((a, b) => b.position.start - a.position.start);

      for (const segment of sortedSegments) {
        const { start, end } = segment.position;
        const level = segment.level;
        
        const beforeText = highlightedText.substring(0, start + offset);
        const highlightedSegment = `<span class="risk-highlight-${level}">${highlightedText.substring(start + offset, end + offset)}</span>`;
        const afterText = highlightedText.substring(end + offset);

        // 计算新的位置偏移
        const originalLength = end - start;
        const newLength = highlightedSegment.length;
        offset += (newLength - originalLength);

        highlightedText = beforeText + highlightedSegment + afterText;
      }

      this.highlightedPolicy = highlightedText;
    }
  };
}; 