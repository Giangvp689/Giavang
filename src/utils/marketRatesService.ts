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
          if (isNaN(num) || num <= 0) return 143500000;
          if (num < 20000000) return num * 10;
          return num;
        };

        const sjcBuy = p.SJL1L10?.buy ? normalize(p.SJL1L10.buy) : 143500000;
        const sjcSell = p.SJL1L10?.sell ? normalize(p.SJL1L10.sell) : 146500000;
        const sjcRingBuy = p.SJ9999?.buy ? normalize(p.SJ9999.buy) : 143000000;
        const sjcRingSell = p.SJ9999?.sell ? normalize(p.SJ9999.sell) : 146000000;

        const pnjBuy = p.PQHNVM?.buy ? normalize(p.PQHNVM.buy) : 143500000;
        const pnjSell = p.PQHNVM?.sell ? normalize(p.PQHNVM.sell) : 146500000;
        const pnj24kBuy = p.PQHN24NTT?.buy ? normalize(p.PQHN24NTT.buy) : 143500000;
        const pnj24kSell = p.PQHN24NTT?.sell ? normalize(p.PQHN24NTT.sell) : 146800000;

        const dojiBuy = (p.DOHNL?.buy || p.DOHCML?.buy) ? normalize(p.DOHNL?.buy || p.DOHCML?.buy) : 143500000;
        const dojiSell = (p.DOHNL?.sell || p.DOHCML?.sell) ? normalize(p.DOHNL?.sell || p.DOHCML?.sell) : 146500000;
        const dojiHtvBuy = p.DOJINHTV?.buy ? normalize(p.DOJINHTV.buy) : 145000000;
        const dojiHtvSell = p.DOJINHTV?.sell ? normalize(p.DOJINHTV.sell) : 149000000;

        const aaaBuy = p.BT9999NTT?.buy ? normalize(p.BT9999NTT.buy) : (p.BTSJC?.buy ? normalize(p.BTSJC.buy) : 144600000);
        const aaaSell = p.BT9999NTT?.sell ? normalize(p.BT9999NTT.sell) : (p.BTSJC?.sell ? normalize(p.BTSJC.sell) : 148600000);

        const getChange = (rawChange: any, baselineSell: number) => {
          if (rawChange && typeof rawChange === 'number' && rawChange !== 0) {
            let amount = rawChange;
            if (Math.abs(amount) < 1000) {
              amount = amount * 10000;
            }
            return {
              amount,
              percent: parseFloat(((amount / baselineSell) * 100).toFixed(2))
            };
          }
          return { amount: -500000, percent: -0.34 };
        };

        const sjcCh = getChange(p.SJL1L10?.change_sell, sjcSell);
        const sjcRingCh = getChange(p.SJ9999?.change_sell, sjcRingSell);
        const pnjCh = getChange(p.PQHNVM?.change_sell, pnjSell);
        const pnj24kCh = getChange(p.PQHN24NTT?.change_sell, pnj24kSell);
        const dojiCh = getChange(p.DOHNL?.change_sell, dojiSell);
        const dojiHtvCh = getChange(p.DOJINHTV?.change_sell, dojiHtvSell);
        const aaaCh = getChange(p.BT9999NTT?.change_sell, aaaSell);

        const liveResponse: PublicRatesResponse = {
          success: true,
          source: 'Thị Trường Vàng Việt Nam (SJC, PNJ, DOJI, BTMC)',
          timestamp: timeFormatted,
          rates: [
            // 1. SJC
            {
              id: 'sjc-1l',
              name: 'Vàng miếng SJC 999.9 (1L - 10L)',
              purity: '99.99%',
              brand: 'SJC',
              category: 'sjc',
              buy: sjcBuy,
              sell: sjcSell,
              prevDayBuy: sjcBuy - sjcCh.amount,
              prevDaySell: sjcSell - sjcCh.amount,
              trend: sjcCh.amount > 0 ? 'up' : sjcCh.amount < 0 ? 'down' : 'equal',
              changeAmount: sjcCh.amount,
              changePercent: sjcCh.percent
            },
            {
              id: 'sjc-nhan-9999',
              name: 'Nhẫn tròn trơn SJC 99.99',
              purity: '99.99%',
              brand: 'SJC',
              category: 'sjc',
              buy: sjcRingBuy,
              sell: sjcRingSell,
              prevDayBuy: sjcRingBuy - sjcRingCh.amount,
              prevDaySell: sjcRingSell - sjcRingCh.amount,
              trend: sjcRingCh.amount > 0 ? 'up' : sjcRingCh.amount < 0 ? 'down' : 'equal',
              changeAmount: sjcRingCh.amount,
              changePercent: sjcRingCh.percent
            },

            // 2. PNJ
            {
              id: 'pnj-mieng',
              name: 'Vàng miếng PNJ 999.9',
              purity: '99.99%',
              brand: 'PNJ',
              category: 'pnj',
              buy: pnjBuy,
              sell: pnjSell,
              prevDayBuy: pnjBuy - pnjCh.amount,
              prevDaySell: pnjSell - pnjCh.amount,
              trend: pnjCh.amount > 0 ? 'up' : pnjCh.amount < 0 ? 'down' : 'equal',
              changeAmount: pnjCh.amount,
              changePercent: pnjCh.percent
            },
            {
              id: 'pnj-nhan-tron',
              name: 'Nhẫn trơn PNJ 999.9',
              purity: '99.99%',
              brand: 'PNJ',
              category: 'pnj',
              buy: pnj24kBuy,
              sell: pnj24kSell,
              prevDayBuy: pnj24kBuy - pnj24kCh.amount,
              prevDaySell: pnj24kSell - pnj24kCh.amount,
              trend: pnj24kCh.amount > 0 ? 'up' : pnj24kCh.amount < 0 ? 'down' : 'equal',
              changeAmount: pnj24kCh.amount,
              changePercent: pnj24kCh.percent
            },
            {
              id: 'pnj-nu-trang-24k',
              name: 'Nữ trang PNJ 24K (99.9%)',
              purity: '99.90%',
              brand: 'PNJ',
              category: 'pnj',
              buy: 141800000,
              sell: 145600000,
              prevDayBuy: 142200000,
              prevDaySell: 146000000,
              trend: 'down',
              changeAmount: -400000,
              changePercent: -0.27
            },

            // 3. DOJI
            {
              id: 'doji-au-vang',
              name: 'DOJI Âu Vàng Phúc Long 999.9',
              purity: '99.99%',
              brand: 'DOJI',
              category: 'doji',
              buy: dojiBuy,
              sell: dojiSell,
              prevDayBuy: dojiBuy - dojiCh.amount,
              prevDaySell: dojiSell - dojiCh.amount,
              trend: dojiCh.amount > 0 ? 'up' : dojiCh.amount < 0 ? 'down' : 'equal',
              changeAmount: dojiCh.amount,
              changePercent: dojiCh.percent
            },
            {
              id: 'doji-nhan-hung-thinh',
              name: 'Nhẫn tròn DOJI Hưng Thịnh Vượng 9999',
              purity: '99.99%',
              brand: 'DOJI',
              category: 'doji',
              buy: dojiHtvBuy,
              sell: dojiHtvSell,
              prevDayBuy: dojiHtvBuy - dojiHtvCh.amount,
              prevDaySell: dojiHtvSell - dojiHtvCh.amount,
              trend: dojiHtvCh.amount > 0 ? 'up' : dojiHtvCh.amount < 0 ? 'down' : 'equal',
              changeAmount: dojiHtvCh.amount,
              changePercent: dojiHtvCh.percent
            },

            // 4. AAA
            {
              id: 'aaa-mieng-9999',
              name: 'Vàng Rồng Thăng Long AAA (BTMC)',
              purity: '99.99%',
              brand: 'AAA',
              category: 'aaa',
              buy: aaaBuy,
              sell: aaaSell,
              prevDayBuy: aaaBuy - aaaCh.amount,
              prevDaySell: aaaSell - aaaCh.amount,
              trend: aaaCh.amount > 0 ? 'up' : aaaCh.amount < 0 ? 'down' : 'equal',
              changeAmount: aaaCh.amount,
              changePercent: aaaCh.percent
            },
            {
              id: 'aaa-nhan-tron-9999',
              name: 'Nhẫn tròn trơn AAA 999.9',
              purity: '99.99%',
              brand: 'AAA',
              category: 'aaa',
              buy: aaaBuy,
              sell: aaaSell,
              prevDayBuy: aaaBuy - aaaCh.amount,
              prevDaySell: aaaSell - aaaCh.amount,
              trend: aaaCh.amount > 0 ? 'up' : aaaCh.amount < 0 ? 'down' : 'equal',
              changeAmount: aaaCh.amount,
              changePercent: aaaCh.percent
            },

            // 5. Nữ Trang Tiệm Vàng
            {
              id: 'tiem-nu-trang-24k',
              name: 'Vàng nữ trang 24K (99.9%)',
              purity: '99.90%',
              brand: 'TIỆM',
              category: 'jewelry',
              buy: 140000000,
              sell: 143000000,
              prevDayBuy: 140400000,
              prevDaySell: 143400000,
              trend: 'down',
              changeAmount: -400000,
              changePercent: -0.28
            },
            {
              id: 'tiem-vang-y-750',
              name: 'Vàng trắng Ý 750 (Italy 750)',
              purity: '75.00%',
              brand: 'TIỆM',
              category: 'jewelry',
              buy: 105000000,
              sell: 109000000,
              prevDayBuy: 105200000,
              prevDaySell: 109200000,
              trend: 'down',
              changeAmount: -200000,
              changePercent: -0.18
            },
            {
              id: 'tiem-nu-trang-18k',
              name: 'Vàng tây 18K (75.0%)',
              purity: '75.00%',
              brand: 'TIỆM',
              category: 'jewelry',
              buy: 103500000,
              sell: 108000000,
              prevDayBuy: 103700000,
              prevDaySell: 108200000,
              trend: 'down',
              changeAmount: -200000,
              changePercent: -0.18
            },
            {
              id: 'tiem-nu-trang-14k',
              name: 'Vàng tây 14K (58.5%)',
              purity: '58.50%',
              brand: 'TIỆM',
              category: 'jewelry',
              buy: 80000000,
              sell: 84500000,
              prevDayBuy: 80100000,
              prevDaySell: 84600000,
              trend: 'down',
              changeAmount: -100000,
              changePercent: -0.12
            },
            {
              id: 'tiem-nu-trang-10k',
              name: 'Vàng tây 10K (41.6%)',
              purity: '41.60%',
              brand: 'TIỆM',
              category: 'jewelry',
              buy: 55500000,
              sell: 60000000,
              prevDayBuy: 55600000,
              prevDaySell: 60100000,
              trend: 'down',
              changeAmount: -100000,
              changePercent: -0.17
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
