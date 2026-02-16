// 股票数据同步服务
// 定时从 Alpha Vantage 获取数据并存入数据库

import { query } from '../db.js';
import { getDailyPrices, getQuote } from './alphavantage.js';

/**
 * 同步单只股票的价格数据
 */
export async function syncStockPrices(symbol) {
  const client = await query('SELECT 1'); // 获取连接

  try {
    console.log(`\n🔄 同步 ${symbol} 的价格数据...`);

    // 1. 获取股票 ID
    const stockResult = await query(
      'SELECT id FROM stocks WHERE symbol = $1',
      [symbol]
    );

    if (stockResult.rows.length === 0) {
      console.warn(`⚠️  找不到股票: ${symbol}`);
      return false;
    }

    const stockId = stockResult.rows[0].id;

    // 2. 记录开始时间
    const syncLogResult = await query(
      'INSERT INTO stock_sync_logs (stock_id, sync_type, status) VALUES ($1, $2, $3) RETURNING id',
      [stockId, 'daily', 'pending']
    );
    const syncLogId = syncLogResult.rows[0].id;

    try {
      // 3. 从 API 获取数据
      const prices = await getDailyPrices(symbol);

      if (!prices || prices.length === 0) {
        await query(
          'UPDATE stock_sync_logs SET status = $1, error_message = $2 WHERE id = $3',
          ['failed', '未获取到数据', syncLogId]
        );
        console.warn(`⚠️  ${symbol}: 未获取到价格数据`);
        return false;
      }

      // 4. 批量插入价格数据
      let insertedCount = 0;
      let skippedCount = 0;

      for (const price of prices) {
        try {
          // 计算涨跌幅
          const priceChange = price.close - price.open;
          const changePercent = (priceChange / price.open * 100).toFixed(4);

          await query(
            `INSERT INTO stock_prices (
              stock_id, trade_date, open_price, high_price, low_price, close_price, volume, price_change, change_percent
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (stock_id, trade_date) DO UPDATE SET
              open_price = $3, high_price = $4, low_price = $5, close_price = $6, volume = $7,
              price_change = $8, change_percent = $9`,
            [
              stockId,
              price.date,
              price.open,
              price.high,
              price.low,
              price.close,
              price.volume,
              priceChange,
              changePercent
            ]
          );

          insertedCount++;
        } catch (error) {
          if (error.code === '23505') { // UNIQUE 冲突
            skippedCount++;
          } else {
            throw error;
          }
        }
      }

      // 5. 更新股票的最后更新时间
      await query(
        'UPDATE stocks SET last_updated_at = NOW(), last_synced_at = NOW() WHERE id = $1',
        [stockId]
      );

      // 6. 更新同步日志
      await query(
        'UPDATE stock_sync_logs SET status = $1, records_added = $2, completed_at = NOW() WHERE id = $3',
        ['success', insertedCount, syncLogId]
      );

      console.log(`✅ ${symbol}: 添加 ${insertedCount} 条, 跳过 ${skippedCount} 条`);
      return true;

    } catch (error) {
      // 记录失败信息
      await query(
        'UPDATE stock_sync_logs SET status = $1, error_message = $2, completed_at = NOW() WHERE id = $3',
        ['failed', error.message, syncLogId]
      );

      console.error(`❌ ${symbol} 同步失败:`, error.message);
      return false;
    }

  } catch (error) {
    console.error(`❌ 同步 ${symbol} 时发生错误:`, error.message);
    return false;
  }
}

/**
 * 同步所有默认股票
 */
export async function syncAllDefaultStocks() {
  try {
    console.log('\n');
    console.log('═════════════════════════════════════════');
    console.log('📊 开始同步所有默认股票的价格数据');
    console.log('═════════════════════════════════════════');

    // 获取所有默认股票
    const result = await query(
      'SELECT symbol FROM stocks WHERE is_default = TRUE ORDER BY symbol'
    );

    if (result.rows.length === 0) {
      console.warn('⚠️  没有找到默认股票');
      return false;
    }

    const symbols = result.rows.map(r => r.symbol);
    console.log(`\n🎯 需要同步 ${symbols.length} 只股票: ${symbols.join(', ')}`);
    console.log('');

    let successCount = 0;
    let failedCount = 0;

    // 逐个同步
    for (const symbol of symbols) {
      const success = await syncStockPrices(symbol);
      if (success) {
        successCount++;
      } else {
        failedCount++;
      }

      // 等待一下，避免触发 API 频率限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n');
    console.log('═════════════════════════════════════════');
    console.log(`📈 同步完成: ✅ ${successCount} 个成功, ❌ ${failedCount} 个失败`);
    console.log('═════════════════════════════════════════');
    console.log('');

    return failedCount === 0;

  } catch (error) {
    console.error('❌ 同步所有股票失败:', error.message);
    return false;
  }
}

/**
 * 定时任务：每天 9:30 AM UTC 同步数据（美股开盘时间）
 * 注意：需要在服务器启动时设置
 */
export function scheduleDailySync() {
  // 计算到下一个 9:30 AM UTC 的时间
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(14, 30, 0, 0); // 14:30 UTC = 9:30 AM ET

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  const delayMs = target.getTime() - now.getTime();
  const delayHours = (delayMs / 1000 / 3600).toFixed(2);

  console.log(`⏰ 已安排每日同步任务，下次执行在 ${delayHours} 小时后`);

  // 首次执行
  setTimeout(() => {
    syncAllDefaultStocks();

    // 之后每 24 小时执行一次
    setInterval(() => {
      syncAllDefaultStocks();
    }, 24 * 60 * 60 * 1000);
  }, delayMs);
}

export default {
  syncStockPrices,
  syncAllDefaultStocks,
  scheduleDailySync
};
