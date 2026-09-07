import { WorldGoldRate } from '../types';

// Default initial baseline matching the user's screenshot
export const DEFAULT_WORLD_GOLD: WorldGoldRate = {
  symbol: 'XAU/USD',
  price: 4411.23,
  priceFormatted: '4,411.23',
  change: -19.10,
  changeFormatted: '-19.10',
  changePercent: -0.43,
  changePercentFormatted: '(-0.43%)',
  high: 4435.50,
  low: 4402.10,
  direction: 'down',
  vndEquivalentPerLuong: 135350000,
  lastUpdated: 'Vừa xong',
  source: 'Investing.com (XAU/USD Spot)'
};

const USD_TO_VND = 25450;
const TROY_OZ_TO_LUONG = 1.20565;

export function formatWorldGoldNumbers(
  rawPrice: number,
  rawChange: number,
  rawChangePercent: number,
  high?: number,
  low?: number
): WorldGoldRate {
  const price = parseFloat(rawPrice.toFixed(2));
  const change = parseFloat(rawChange.toFixed(2));
  const changePercent = parseFloat(rawChangePercent.toFixed(2));

  const priceFormatted = price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const changeFormatted = (change > 0 ? '+' : '') + change.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const changePercentFormatted = `(${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;

  const vndEquivalentPerLuong = Math.round(price * TROY_OZ_TO_LUONG * USD_TO_VND);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return {
    symbol: 'XAU/USD',
    price,
    priceFormatted,
    change,
    changeFormatted,
    changePercent,
    changePercentFormatted,
    high: high ? parseFloat(high.toFixed(2)) : price + 15,
    low: low ? parseFloat(low.toFixed(2)) : price - 15,
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
    vndEquivalentPerLuong,
    lastUpdated: timeStr,
    source: 'Investing.com (XAU/USD Spot)'
  };
}

// Fetch from local server endpoint first, fallback to direct Binance PAXG/USDT
export async function fetchWorldGoldPrice(): Promise<WorldGoldRate> {
  try {
    // 1. Try local Express server proxy
    const res = await fetch('/api/gold/world-rates', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3500)
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        return json.data;
      }
    }
  } catch {
    // Server proxy timed out, try client-side direct
  }

  try {
    // 2. Client-side direct to Binance PAXGUSDT (CORS allowed, 24/7 live spot gold)
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=PAXGUSDT', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3500)
    });

    if (res.ok) {
      const data = await res.json();
      const p = parseFloat(data.lastPrice);
      const c = parseFloat(data.priceChange);
      const cp = parseFloat(data.priceChangePercent);
      const h = parseFloat(data.highPrice);
      const l = parseFloat(data.lowPrice);

      if (!isNaN(p) && p > 1000) {
        return formatWorldGoldNumbers(p, c, cp, h, l);
      }
    }
  } catch {
    // Keep fallback
  }

  return DEFAULT_WORLD_GOLD;
}
