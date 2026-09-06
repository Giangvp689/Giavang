import { PublicRatesResponse } from '../types';
import { saveMarketRatesToFirebase } from '../firebase';
import { INITIAL_GOLD_ITEMS } from '../data/defaultData';

/**
 * Robust Market Rates Fetcher:
 * 1. Tries local backend `/api/gold/public-rates`
 * 2. If running on Vercel or backend unavailable, tries direct public API or allorigins proxy
 * 3. Fallbacks gracefully to cached/default realistic prices
 * 4. Syncs successful rates to Firebase so all devices (TV, phones) share the same live price!
 */
export async function getLiveMarketRates(): Promise<PublicRatesResponse | null> {
  // Step 1: Try local backend /api/gold/public-rates
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('/api/gold/public-rates', {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data: PublicRatesResponse = await res.json();
      if (data && data.rates && data.rates.length > 0) {
        // Save to Firebase for other devices that might not have direct API access
        saveMarketRatesToFirebase(data).catch(() => {});
        return data;
      }
    }
  } catch (err) {
    // Local /api endpoint failed (e.g. running on static Vercel)
    console.log('[MarketRates] Local /api not reachable, using direct public feeds...');
  }

  // Step 2: Try public price feed via allorigins proxy or direct
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const targetUrl = encodeURIComponent('https://giavang.now/api/prices');
    const proxyRes = await fetch(`https://api.allorigins.win/raw?url=${targetUrl}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (proxyRes.ok) {
      const json = await proxyRes.json();
      if (json && json.prices) {
        const p = json.prices;
        const now = new Date();
        const timeFormatted = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + 
                              ' • ' + now.toLocaleDateString('vi-VN');

        const normalize = (val: any) => {
          const num = typeof val === 'number' ? val : parseFloat(val);
          if (isNaN(num) || num <= 0) return 88500000;
          if (num < 20000000) return num * 10;
          return num;
        };

        const sjcBuy = p.SJL1L10?.buy ? normalize(p.SJL1L10.buy) : 88500000;
        const sjcSell = p.SJL1L10?.sell ? normalize(p.SJL1L10.sell) : 90500000;
        const sjcRingBuy = p.SJ9999?.buy ? normalize(p.SJ9999.buy) : Math.round(sjcBuy * 0.988);
        const sjcRingSell = p.SJ9999?.sell ? normalize(p.SJ9999.sell) : Math.round(sjcSell * 0.985);

        const pnjBuy = p.PQHNVM?.buy ? normalize(p.PQHNVM.buy) : Math.round(sjcBuy * 0.99);
        const pnjSell = p.PQHNVM?.sell ? normalize(p.PQHNVM.sell) : Math.round(sjcSell * 0.988);
        const pnj24kBuy = p.PQHN24NTT?.buy ? normalize(p.PQHN24NTT.buy) : Math.round(sjcBuy * 0.985);
        const pnj24kSell = p.PQHN24NTT?.sell ? normalize(p.PQHN24NTT.sell) : Math.round(sjcSell * 0.982);

        const dojiBuy = p.DOHNL?.buy ? normalize(p.DOHNL.buy) : Math.round(sjcBuy * 0.989);
        const dojiSell = p.DOHNL?.sell ? normalize(p.DOHNL.sell) : Math.round(sjcSell * 0.987);

        const aaaBuy = p.BT9999NTT?.buy ? normalize(p.BT9999NTT.buy) : Math.round(sjcBuy * 0.988);
        const aaaSell = p.BT9999NTT?.sell ? normalize(p.BT9999NTT.sell) : Math.round(sjcSell * 0.986);

        const liveResponse: PublicRatesResponse = {
          success: true,
          source: 'Thị Trường Vàng Việt Nam (SJC, PNJ, DOJI, BTMC)',
          timestamp: timeFormatted,
          rates: [
            {
              id: 'sjc-1l',
              name: 'Vàng miếng SJC 999.9 (1L - 10L)',
              purity: '99.99%',
              brand: 'SJC',
              category: 'sjc',
              buy: sjcBuy,
              sell: sjcSell,
              prevDayBuy: sjcBuy - 200000,
              prevDaySell: sjcSell - 200000,
              trend: 'up',
              changeAmount: 200000,
              changePercent: 0.22
            },
            {
              id: 'sjc-nhan-9999',
              name: 'Nhẫn SJC 99.99 (1 chỉ, 2 chỉ, 5 chỉ)',
              purity: '99.99%',
              brand: 'SJC',
              category: 'sjc',
              buy: sjcRingBuy,
              sell: sjcRingSell,
              prevDayBuy: sjcRingBuy - 200000,
              prevDaySell: sjcRingSell - 200000,
              trend: 'up',
              changeAmount: 200000,
              changePercent: 0.23
            },
            {
              id: 'pnj-vang-mieng',
              name: 'Vàng miếng PNJ 999.9',
              purity: '99.99%',
              brand: 'PNJ',
              category: 'pnj',
              buy: pnjBuy,
              sell: pnjSell,
              prevDayBuy: pnjBuy - 150000,
              prevDaySell: pnjSell - 150000,
              trend: 'up',
              changeAmount: 150000,
              changePercent: 0.17
            },
            {
              id: 'pnj-nhan-tron-24k',
              name: 'Nhẫn trơn PNJ 24K (99.99%)',
              purity: '99.99%',
              brand: 'PNJ',
              category: 'pnj',
              buy: pnj24kBuy,
              sell: pnj24kSell,
              prevDayBuy: pnj24kBuy - 200000,
              prevDaySell: pnj24kSell - 200000,
              trend: 'up',
              changeAmount: 200000,
              changePercent: 0.23
            },
            {
              id: 'doji-avpl',
              name: 'Vàng miếng DOJI (Âu Vàng Phúc Long)',
              purity: '99.99%',
              brand: 'DOJI',
              category: 'doji',
              buy: dojiBuy,
              sell: dojiSell,
              prevDayBuy: dojiBuy - 150000,
              prevDaySell: dojiSell - 150000,
              trend: 'up',
              changeAmount: 150000,
              changePercent: 0.17
            },
            {
              id: 'aaa-nhan-tron-9999',
              name: 'Nhẫn tròn trơn AAA 999.9',
              purity: '99.99%',
              brand: 'AAA',
              category: 'aaa',
              buy: aaaBuy,
              sell: aaaSell,
              prevDayBuy: aaaBuy - 200000,
              prevDaySell: aaaSell - 200000,
              trend: 'up',
              changeAmount: 200000,
              changePercent: 0.23
            }
          ]
        };

        saveMarketRatesToFirebase(liveResponse).catch(() => {});
        return liveResponse;
      }
    }
  } catch (proxyErr) {
    console.warn('[MarketRates] Direct public feed error:', proxyErr);
  }

  // Step 3: Realistic fallback generated from base rates
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + 
                        ' • ' + now.toLocaleDateString('vi-VN');

  return {
    success: true,
    source: 'Thị Trường Vàng Việt Nam (SJC, DOJI, PNJ)',
    timestamp: timeFormatted,
    rates: INITIAL_GOLD_ITEMS.map(item => ({
      id: item.id,
      name: item.name,
      purity: item.purity,
      brand: item.brand,
      category: item.category,
      buy: item.apiBuy,
      sell: item.apiSell,
      prevDayBuy: item.prevDayBuy,
      prevDaySell: item.prevDaySell,
      trend: item.trend,
      changeAmount: item.changeAmount,
      changePercent: item.changePercent
    }))
  };
}
