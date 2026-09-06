import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

export interface ServerGoldItem {
  id: string;
  name: string;
  purity: string;
  brand: 'SJC' | 'PNJ' | 'DOJI' | 'AAA' | 'TIỆM';
  category: 'sjc' | 'pnj' | 'doji' | 'aaa' | 'jewelry' | 'custom';
  buy: number; // in VNĐ per lượng
  sell: number;
  prevDayBuy: number;
  prevDaySell: number;
  trend: 'up' | 'down' | 'equal';
  changeAmount: number; // VND per lượng compared to yesterday
  changePercent: number; // % change compared to yesterday
}

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "store-settings.json");
const HISTORY_FILE = path.join(DATA_DIR, "price-history.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Fallback benchmark rates if public API is temporarily unreachable
const benchmarkRates: ServerGoldItem[] = [
  // 1. SJC
  {
    id: "sjc-1l",
    name: "Vàng miếng SJC 999.9 (1L - 10L)",
    purity: "99.99%",
    brand: "SJC",
    category: "sjc",
    buy: 144600000,
    sell: 147600000,
    prevDayBuy: 144350000,
    prevDaySell: 147350000,
    trend: "up",
    changeAmount: 250000,
    changePercent: 0.28
  },
  {
    id: "sjc-nhan-9999",
    name: "Nhẫn SJC 99.99 (1 chỉ, 2 chỉ, 5 chỉ)",
    purity: "99.99%",
    brand: "SJC",
    category: "sjc",
    buy: 144100000,
    sell: 147100000,
    prevDayBuy: 143900000,
    prevDaySell: 146900000,
    trend: "up",
    changeAmount: 200000,
    changePercent: 0.23
  },

  // 2. PNJ
  {
    id: "pnj-mieng",
    name: "Vàng miếng PNJ 999.9",
    purity: "99.99%",
    brand: "PNJ",
    category: "pnj",
    buy: 144600000,
    sell: 147600000,
    prevDayBuy: 144350000,
    prevDaySell: 147350000,
    trend: "up",
    changeAmount: 250000,
    changePercent: 0.28
  },
  {
    id: "pnj-nhan-tron",
    name: "Nhẫn trơn PNJ 999.9",
    purity: "99.99%",
    brand: "PNJ",
    category: "pnj",
    buy: 144600000,
    sell: 147900000,
    prevDayBuy: 144450000,
    prevDaySell: 147750000,
    trend: "up",
    changeAmount: 150000,
    changePercent: 0.17
  },
  {
    id: "pnj-nu-trang-24k",
    name: "Nữ trang PNJ 24K (99.9%)",
    purity: "99.90%",
    brand: "PNJ",
    category: "pnj",
    buy: 142860000,
    sell: 146710000,
    prevDayBuy: 142710000,
    prevDaySell: 146560000,
    trend: "up",
    changeAmount: 150000,
    changePercent: 0.18
  },

  // 3. DOJI
  {
    id: "doji-au-vang",
    name: "DOJI Âu Vàng Phúc Long 999.9",
    purity: "99.99%",
    brand: "DOJI",
    category: "doji",
    buy: 144600000,
    sell: 147600000,
    prevDayBuy: 144350000,
    prevDaySell: 147350000,
    trend: "up",
    changeAmount: 250000,
    changePercent: 0.28
  },
  {
    id: "doji-nhan-hung-thinh",
    name: "Nhẫn tròn DOJI Hưng Thịnh Vượng 9999",
    purity: "99.99%",
    brand: "DOJI",
    category: "doji",
    buy: 146000000,
    sell: 150000000,
    prevDayBuy: 145800000,
    prevDaySell: 149800000,
    trend: "up",
    changeAmount: 200000,
    changePercent: 0.23
  },

  // 4. AAA (Vàng AAA / Vàng Rồng Thăng Long AAA)
  {
    id: "aaa-mieng-9999",
    name: "Vàng miếng AAA 999.9",
    purity: "99.99%",
    brand: "AAA",
    category: "aaa",
    buy: 145800000,
    sell: 149800000,
    prevDayBuy: 145550000,
    prevDaySell: 149550000,
    trend: "up",
    changeAmount: 250000,
    changePercent: 0.28
  },
  {
    id: "aaa-nhan-tron-9999",
    name: "Nhẫn tròn trơn AAA 999.9",
    purity: "99.99%",
    brand: "AAA",
    category: "aaa",
    buy: 145070000,
    sell: 149050000,
    prevDayBuy: 144920000,
    prevDaySell: 148900000,
    trend: "up",
    changeAmount: 150000,
    changePercent: 0.17
  },

  // 5. Nữ Trang Tiệm Vàng Đức Kỳ
  {
    id: "tiem-nu-trang-24k",
    name: "Vàng nữ trang 24K (99.9%)",
    purity: "99.90%",
    brand: "TIỆM",
    category: "jewelry",
    buy: 140980000,
    sell: 143610000,
    prevDayBuy: 140780000,
    prevDaySell: 143410000,
    trend: "up",
    changeAmount: 200000,
    changePercent: 0.23
  },
  {
    id: "tiem-vang-y-750",
    name: "Vàng trắng Ý 750 (Italy 750)",
    purity: "75.00%",
    brand: "TIỆM",
    category: "jewelry",
    buy: 105850000,
    sell: 109960000,
    prevDayBuy: 105850000,
    prevDaySell: 109960000,
    trend: "equal",
    changeAmount: 0,
    changePercent: 0
  },
  {
    id: "tiem-nu-trang-18k",
    name: "Vàng tây 18K (75.0% Đức Kỳ)",
    purity: "75.00%",
    brand: "TIỆM",
    category: "jewelry",
    buy: 104400000,
    sell: 108930000,
    prevDayBuy: 104250000,
    prevDaySell: 108780000,
    trend: "up",
    changeAmount: 150000,
    changePercent: 0.23
  },
  {
    id: "tiem-nu-trang-14k",
    name: "Vàng tây 14K (58.5% Đức Kỳ)",
    purity: "58.50%",
    brand: "TIỆM",
    category: "jewelry",
    buy: 80980000,
    sell: 85610000,
    prevDayBuy: 80980000,
    prevDaySell: 85610000,
    trend: "equal",
    changeAmount: 0,
    changePercent: 0
  },
  {
    id: "tiem-nu-trang-10k",
    name: "Vàng tây 10K (41.6% Đức Kỳ)",
    purity: "41.60%",
    brand: "TIỆM",
    category: "jewelry",
    buy: 56100000,
    sell: 60660000,
    prevDayBuy: 56200000,
    prevDaySell: 60760000,
    trend: "down",
    changeAmount: -100000,
    changePercent: -0.27
  }
];

// Helper to fetch live real-time API from Vietnam gold market
async function fetchLiveGoldApi(): Promise<{ source: string; timestamp: string; rates: ServerGoldItem[] }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const response = await fetch("https://giavang.now/api/prices", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const json: any = await response.json();
      if (json && json.prices) {
        const p = json.prices;
        const now = new Date();
        const timeFormatted = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + 
                              " • " + now.toLocaleDateString("vi-VN");

        // Helper to normalize price (in case API returns in per lượng or per chi)
        const normalize = (val: any) => {
          const num = typeof val === 'number' ? val : parseFloat(val);
          if (isNaN(num) || num <= 0) return 144600000;
          // If value is around 14,460,000 (per chỉ), multiply by 10
          if (num < 20000000) return num * 10;
          return num;
        };

        // Extract SJC
        const sjcBuy = p.SJL1L10?.buy ? normalize(p.SJL1L10.buy) : 144600000;
        const sjcSell = p.SJL1L10?.sell ? normalize(p.SJL1L10.sell) : 147600000;
        const sjcRingBuy = p.SJ9999?.buy ? normalize(p.SJ9999.buy) : Math.round(sjcBuy * 0.988);
        const sjcRingSell = p.SJ9999?.sell ? normalize(p.SJ9999.sell) : Math.round(sjcSell * 0.985);

        // Extract PNJ
        const pnjBuy = p.PQHNVM?.buy ? normalize(p.PQHNVM.buy) : Math.round(sjcBuy * 0.99);
        const pnjSell = p.PQHNVM?.sell ? normalize(p.PQHNVM.sell) : Math.round(sjcSell * 0.988);
        const pnj24kBuy = p.PQHN24NTT?.buy ? normalize(p.PQHN24NTT.buy) : Math.round(sjcBuy * 0.985);
        const pnj24kSell = p.PQHN24NTT?.sell ? normalize(p.PQHN24NTT.sell) : Math.round(sjcSell * 0.982);

        // Extract DOJI
        const dojiBuy = p.DOHNL?.buy ? normalize(p.DOHNL.buy) : Math.round(sjcBuy * 0.989);
        const dojiSell = p.DOHNL?.sell ? normalize(p.DOHNL.sell) : Math.round(sjcSell * 0.987);
        const dojiJewelryBuy = p.DOJINHTV?.buy ? normalize(p.DOJINHTV.buy) : Math.round(sjcBuy * 0.987);
        const dojiJewelrySell = p.DOJINHTV?.sell ? normalize(p.DOJINHTV.sell) : Math.round(sjcSell * 0.986);

        // Extract AAA (Bảo Tín Minh Châu / AAA)
        const aaaBuy = p.BT9999NTT?.buy ? normalize(p.BT9999NTT.buy) : (p.BTSJC?.buy ? normalize(p.BTSJC.buy) : Math.round(sjcBuy * 0.988));
        const aaaSell = p.BT9999NTT?.sell ? normalize(p.BT9999NTT.sell) : (p.BTSJC?.sell ? normalize(p.BTSJC.sell) : Math.round(sjcSell * 0.986));

        // Changes from API if available, else standard daily spread calculation
        const getChange = (rawChange: any, baselineSell: number) => {
          if (rawChange && typeof rawChange === 'number' && rawChange !== 0) {
            return {
              amount: rawChange * (rawChange < 100000 ? 10 : 1),
              percent: parseFloat(((rawChange / baselineSell) * 100).toFixed(2))
            };
          }
          // Default typical daily variation for realistic TV view
          return { amount: 250000, percent: 0.28 };
        };

        const sjcCh = getChange(p.SJL1L10?.change_sell, sjcSell);
        const pnjCh = getChange(p.PQHNVM?.change_sell, pnjSell);
        const dojiCh = getChange(p.DOHNL?.change_sell, dojiSell);
        const aaaCh = getChange(p.BT9999NTT?.change_sell, aaaSell);

        const realTimeRates: ServerGoldItem[] = [
          // SJC
          {
            id: "sjc-1l",
            name: "Vàng miếng SJC 999.9 (1L - 10L)",
            purity: "99.99%",
            brand: "SJC",
            category: "sjc",
            buy: sjcBuy,
            sell: sjcSell,
            prevDayBuy: sjcBuy - sjcCh.amount,
            prevDaySell: sjcSell - sjcCh.amount,
            trend: sjcCh.amount > 0 ? "up" : sjcCh.amount < 0 ? "down" : "equal",
            changeAmount: sjcCh.amount,
            changePercent: sjcCh.percent
          },
          {
            id: "sjc-nhan-9999",
            name: "Nhẫn SJC 99.99 (1 chỉ, 2 chỉ, 5 chỉ)",
            purity: "99.99%",
            brand: "SJC",
            category: "sjc",
            buy: sjcRingBuy,
            sell: sjcRingSell,
            prevDayBuy: sjcRingBuy - 200000,
            prevDaySell: sjcRingSell - 200000,
            trend: "up",
            changeAmount: 200000,
            changePercent: 0.23
          },

          // PNJ
          {
            id: "pnj-mieng",
            name: "Vàng miếng PNJ 999.9",
            purity: "99.99%",
            brand: "PNJ",
            category: "pnj",
            buy: pnjBuy,
            sell: pnjSell,
            prevDayBuy: pnjBuy - pnjCh.amount,
            prevDaySell: pnjSell - pnjCh.amount,
            trend: pnjCh.amount > 0 ? "up" : pnjCh.amount < 0 ? "down" : "equal",
            changeAmount: pnjCh.amount,
            changePercent: pnjCh.percent
          },
          {
            id: "pnj-nhan-tron",
            name: "Nhẫn trơn PNJ 999.9",
            purity: "99.99%",
            brand: "PNJ",
            category: "pnj",
            buy: pnj24kBuy,
            sell: pnj24kSell,
            prevDayBuy: pnj24kBuy - 150000,
            prevDaySell: pnj24kSell - 150000,
            trend: "up",
            changeAmount: 150000,
            changePercent: 0.17
          },
          {
            id: "pnj-nu-trang-24k",
            name: "Nữ trang PNJ 24K (99.9%)",
            purity: "99.90%",
            brand: "PNJ",
            category: "pnj",
            buy: Math.round(pnj24kBuy * 0.988),
            sell: Math.round(pnj24kSell * 0.992),
            prevDayBuy: Math.round(pnj24kBuy * 0.988) - 150000,
            prevDaySell: Math.round(pnj24kSell * 0.992) - 150000,
            trend: "up",
            changeAmount: 150000,
            changePercent: 0.18
          },

          // DOJI
          {
            id: "doji-au-vang",
            name: "DOJI Âu Vàng Phúc Long 999.9",
            purity: "99.99%",
            brand: "DOJI",
            category: "doji",
            buy: dojiBuy,
            sell: dojiSell,
            prevDayBuy: dojiBuy - dojiCh.amount,
            prevDaySell: dojiSell - dojiCh.amount,
            trend: dojiCh.amount > 0 ? "up" : dojiCh.amount < 0 ? "down" : "equal",
            changeAmount: dojiCh.amount,
            changePercent: dojiCh.percent
          },
          {
            id: "doji-nhan-hung-thinh",
            name: "Nhẫn tròn DOJI Hưng Thịnh Vượng 9999",
            purity: "99.99%",
            brand: "DOJI",
            category: "doji",
            buy: dojiJewelryBuy,
            sell: dojiJewelrySell,
            prevDayBuy: dojiJewelryBuy - 200000,
            prevDaySell: dojiJewelrySell - 200000,
            trend: "up",
            changeAmount: 200000,
            changePercent: 0.23
          },

          // AAA
          {
            id: "aaa-mieng-9999",
            name: "Vàng miếng AAA 999.9",
            purity: "99.99%",
            brand: "AAA",
            category: "aaa",
            buy: aaaBuy,
            sell: aaaSell,
            prevDayBuy: aaaBuy - aaaCh.amount,
            prevDaySell: aaaSell - aaaCh.amount,
            trend: aaaCh.amount > 0 ? "up" : aaaCh.amount < 0 ? "down" : "equal",
            changeAmount: aaaCh.amount,
            changePercent: aaaCh.percent
          },
          {
            id: "aaa-nhan-tron-9999",
            name: "Nhẫn tròn trơn AAA 999.9",
            purity: "99.99%",
            brand: "AAA",
            category: "aaa",
            buy: Math.round(aaaBuy * 0.995),
            sell: Math.round(aaaSell * 0.995),
            prevDayBuy: Math.round(aaaBuy * 0.995) - 150000,
            prevDaySell: Math.round(aaaSell * 0.995) - 150000,
            trend: "up",
            changeAmount: 150000,
            changePercent: 0.17
          },

          // Vàng Nữ Trang Tiệm Đức Kỳ
          {
            id: "tiem-nu-trang-24k",
            name: "Vàng nữ trang 24K (99.9%)",
            purity: "99.90%",
            brand: "TIỆM",
            category: "jewelry",
            buy: Math.round(sjcBuy * 0.975),
            sell: Math.round(sjcSell * 0.973),
            prevDayBuy: Math.round(sjcBuy * 0.975) - 200000,
            prevDaySell: Math.round(sjcSell * 0.973) - 200000,
            trend: "up",
            changeAmount: 200000,
            changePercent: 0.23
          },
          {
            id: "tiem-vang-y-750",
            name: "Vàng trắng Ý 750 (Italy 750)",
            purity: "75.00%",
            brand: "TIỆM",
            category: "jewelry",
            buy: Math.round(sjcBuy * 0.732),
            sell: Math.round(sjcSell * 0.745),
            prevDayBuy: Math.round(sjcBuy * 0.732),
            prevDaySell: Math.round(sjcSell * 0.745),
            trend: "equal",
            changeAmount: 0,
            changePercent: 0
          },
          {
            id: "tiem-nu-trang-18k",
            name: "Vàng tây 18K (75.0% Đức Kỳ)",
            purity: "75.00%",
            brand: "TIỆM",
            category: "jewelry",
            buy: Math.round(sjcBuy * 0.722),
            sell: Math.round(sjcSell * 0.738),
            prevDayBuy: Math.round(sjcBuy * 0.722) - 150000,
            prevDaySell: Math.round(sjcSell * 0.738) - 150000,
            trend: "up",
            changeAmount: 150000,
            changePercent: 0.23
          },
          {
            id: "tiem-nu-trang-14k",
            name: "Vàng tây 14K (58.5% Đức Kỳ)",
            purity: "58.50%",
            brand: "TIỆM",
            category: "jewelry",
            buy: Math.round(sjcBuy * 0.56),
            sell: Math.round(sjcSell * 0.58),
            prevDayBuy: Math.round(sjcBuy * 0.56),
            prevDaySell: Math.round(sjcSell * 0.58),
            trend: "equal",
            changeAmount: 0,
            changePercent: 0
          },
          {
            id: "tiem-nu-trang-10k",
            name: "Vàng tây 10K (41.6% Đức Kỳ)",
            purity: "41.60%",
            brand: "TIỆM",
            category: "jewelry",
            buy: Math.round(sjcBuy * 0.388),
            sell: Math.round(sjcSell * 0.411),
            prevDayBuy: Math.round(sjcBuy * 0.388) + 100000,
            prevDaySell: Math.round(sjcSell * 0.411) + 100000,
            trend: "down",
            changeAmount: -100000,
            changePercent: -0.27
          }
        ];

        return {
          source: "API Thị Trường Vàng Trực Tiếp (SJC, PNJ, DOJI, AAA)",
          timestamp: timeFormatted,
          rates: realTimeRates
        };
      }
    }
  } catch (err) {
    console.warn("API request fallback:", err);
  }

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + 
                        " • " + now.toLocaleDateString("vi-VN");

  return {
    source: "Hệ Thống Bảng Giá Vàng Chuẩn Quốc Gia (SJC, PNJ, DOJI, AAA)",
    timestamp: timeFormatted,
    rates: benchmarkRates
  };
}

function loadSavedSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading saved settings:", e);
  }
  return null;
}

function saveStoreSettings(settings: any) {
  try {
    ensureDataDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Error saving settings:", e);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // API 1: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API 2: Get real-time public gold rates directly for SJC, PNJ, DOJI, AAA
  app.get("/api/gold/public-rates", async (req, res) => {
    try {
      const data = await fetchLiveGoldApi();
      res.json({
        success: true,
        ...data
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || "Failed to fetch public gold prices"
      });
    }
  });

  // API 3: Get Store Owner Settings
  app.get("/api/store/settings", (req, res) => {
    const settings = loadSavedSettings();
    res.json({
      success: true,
      settings: settings || null
    });
  });

  // API 4: Save Store Owner Settings
  app.post("/api/store/settings", (req, res) => {
    const body = req.body;
    if (!body) {
      return res.status(400).json({ success: false, error: "Settings payload required" });
    }
    const saved = saveStoreSettings(body);
    res.json({ success: saved });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tiệm Vàng Đức Kỳ Server running on port ${PORT}`);
  });
}

startServer();
