// Alpha Vantage API 集成模块
// 用于获取股票价格数据

import axios from 'axios';

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

// 请求间隔控制（免费版限制：5次/分钟）
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 200; // 毫秒

// ============================================
// 辅助函数
// ============================================

/**
 * 控制请求频率
 * 免费版 API 限制：5 次/分钟
 */
async function throttleRequest() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
}

/**
 * 调用 Alpha Vantage API
 */
async function callAlphaVantageAPI(params) {
  try {
    await throttleRequest();

    const response = await axios.get(BASE_URL, {
      params: {
        apikey: API_KEY,
        ...params
      },
      timeout: 10000
    });

    // 检查是否超过频率限制
    if (response.data['Information'] && response.data['Information'].includes('thank you')) {
      console.warn('⚠️  Alpha Vantage: 超过请求频率限制，请稍后重试');
      return null;
    }

    if (response.data['Note']) {
      console.warn('⚠️  Alpha Vantage:', response.data['Note']);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error('❌ Alpha Vantage API 错误:', error.message);
    throw error;
  }
}

// ============================================
// 公共方法
// ============================================

/**
 * 获取每日价格数据
 * @param {string} symbol - 股票代码 (AAPL, MSFT 等)
 * @returns {Array} 返回价格数据数组 [{date, open, high, low, close, volume}, ...]
 */
export async function getDailyPrices(symbol) {
  try {
    console.log(`📡 获取 ${symbol} 的每日价格数据...`);

    const data = await callAlphaVantageAPI({
      function: 'TIME_SERIES_DAILY',
      symbol: symbol,
      outputsize: 'full' // 完整数据（20年）
    });

    if (!data || !data['Time Series (Daily)']) {
      console.warn(`⚠️  未找到 ${symbol} 的数据`);
      return [];
    }

    // 转换数据格式
    const timeSeries = data['Time Series (Daily)'];
    const prices = Object.entries(timeSeries).map(([date, values]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'])
    }));

    console.log(`✅ 获取 ${symbol} 的 ${prices.length} 条数据`);
    return prices;

  } catch (error) {
    console.error(`❌ 获取 ${symbol} 数据失败:`, error.message);
    throw error;
  }
}

/**
 * 获取最近 5 天的价格数据（快速版）
 * @param {string} symbol - 股票代码
 * @returns {Array} 最近 5 天的价格数据
 */
export async function getRecentPrices(symbol) {
  try {
    const prices = await getDailyPrices(symbol);
    // 返回最近 5 天的数据（跳过非交易日）
    return prices.slice(0, 5);
  } catch (error) {
    console.error(`❌ 获取 ${symbol} 最近数据失败:`, error.message);
    throw error;
  }
}

/**
 * 获取股票的实时引用数据
 * @param {string} symbol - 股票代码
 * @returns {Object} 实时报价 {symbol, price, change, changePercent, timestamp}
 */
export async function getQuote(symbol) {
  try {
    console.log(`📡 获取 ${symbol} 的实时报价...`);

    const data = await callAlphaVantageAPI({
      function: 'GLOBAL_QUOTE',
      symbol: symbol
    });

    if (!data || !data['Global Quote'] || !data['Global Quote']['05. price']) {
      console.warn(`⚠️  未找到 ${symbol} 的实时数据`);
      return null;
    }

    const quote = data['Global Quote'];
    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ 获取 ${symbol} 实时数据失败:`, error.message);
    throw error;
  }
}

/**
 * 检查 API Key 是否有效
 */
export async function validateAPIKey() {
  try {
    console.log('🔍 验证 Alpha Vantage API Key...');

    const data = await callAlphaVantageAPI({
      function: 'GLOBAL_QUOTE',
      symbol: 'AAPL'
    });

    if (data && data['Global Quote'] && data['Global Quote']['05. price']) {
      console.log('✅ API Key 有效！');
      return true;
    }

    if (data['Note']) {
      console.warn('⚠️  API Key 无效或超过限制:', data['Note']);
      return false;
    }

    console.warn('⚠️  无法验证 API Key');
    return false;

  } catch (error) {
    console.error('❌ API Key 验证失败:', error.message);
    return false;
  }
}

/**
 * 测试 API 连接
 */
export async function testConnection() {
  try {
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('🧪 测试 Alpha Vantage API 连接');
    console.log('═══════════════════════════════════════════');

    if (!API_KEY || API_KEY === 'demo') {
      console.warn('⚠️  未配置 API Key，使用演示密钥（功能受限）');
      console.log('📝 请设置环境变量: ALPHA_VANTAGE_API_KEY=<您的API密钥>');
      console.log('🔗 获取免费 API Key: https://www.alphavantage.co/');
      return false;
    }

    const isValid = await validateAPIKey();

    if (isValid) {
      const quote = await getQuote('AAPL');
      console.log('');
      console.log('📊 样本数据 (AAPL):');
      console.log(`   价格: $${quote.price}`);
      console.log(`   涨跌: ${quote.change > 0 ? '+' : ''}${quote.change} (${quote.changePercent}%)`);
      console.log('');
      console.log('✅ Alpha Vantage API 连接成功！');
    }

    console.log('═══════════════════════════════════════════');
    console.log('');

    return isValid;

  } catch (error) {
    console.error('❌ 连接测试失败:', error.message);
    return false;
  }
}

export default {
  getDailyPrices,
  getRecentPrices,
  getQuote,
  validateAPIKey,
  testConnection
};
