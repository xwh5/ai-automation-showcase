export const FIXTURE_META = {
  schemaVersion: 1,
  fixtureId: "price-console-synthetic-v1",
  generatedAt: "2026-11-20T00:00:00.000Z",
  synthetic: true,
  currency: "CNY",
  disclaimer: {
    en: "Synthetic demonstration data only. No platform was scraped; no logged-in price was captured; no purchase can be triggered.",
    zh: "仅合成演示数据。未抓取真实平台，未采集登录态价格，也不会触发购买。",
  },
};

export const SOURCES = [
  {
    id: "alpha",
    nameEn: "Example Shop Alpha",
    nameZh: "示例商店 Alpha",
    url: "https://shop.example.com/synthetic/prices",
    reliability: 0.97,
    note: { en: "Structured listing fixture", zh: "结构化商品列表样本" },
  },
  {
    id: "beta",
    nameEn: "Example Compare Beta",
    nameZh: "示例比价 Beta",
    url: "https://compare.example.net/synthetic/offers",
    reliability: 0.93,
    note: { en: "Noisy multilingual listing fixture", zh: "含噪声的多语言商品样本" },
  },
  {
    id: "gamma",
    nameEn: "Example Catalog Gamma",
    nameZh: "示例目录 Gamma",
    url: "https://catalog.example.org/synthetic/catalog",
    reliability: 0.86,
    note: { en: "Partial-field catalog fixture", zh: "字段不全的目录样本" },
  },
];

const PRODUCT_SEEDS = [
  ["P001", "aster", "AUR-420", "black", 1, "audio", "Aster AUR-420 Headphones", "Aster AUR-420 头戴耳机", 899],
  ["P002", "aster", "AUR-T2", "white", 1, "audio", "Aster AUR-T2 Earbuds", "Aster AUR-T2 真无线耳机", 399],
  ["P003", "aster", "HALO-M1", "blue", 1, "audio", "Aster Halo Mini Speaker", "Aster Halo Mini 蓝牙音箱", 259],
  ["P004", "nori", "KBD-68", "white", 1, "computing", "Nori KBD-68 Keyboard", "Nori KBD-68 机械键盘", 329],
  ["P005", "nori", "KBD-68-Pro", "white", 1, "computing", "Nori KBD-68-Pro Keyboard", "Nori KBD-68-Pro 机械键盘", 499],
  ["P006", "morrow", "DOCK-D12", "silver", 1, "computing", "Morrow Dock D12", "Morrow Dock D12 扩展坞", 459],
  ["P007", "morrow", "LAMP-H7", "beige", 1, "home", "Morrow Halo Desk Lamp", "Morrow Halo 桌面灯", 189],
  ["P008", "vela", "BTL-V8", "green", 1, "outdoor", "Vela Bottle V8 750 ml", "Vela Bottle V8 750 毫升水杯", 129],
  ["P009", "vela", "CELL-C20", "blue", 1, "outdoor", "Vela Cell C20 Power Bank", "Vela Cell C20 充电宝", 199],
  ["P010", "kite", "PUR-F3", "white", 1, "home", "Kite Purifier F3", "Kite Purifier F3 空气净化器", 899],
  ["P011", "kite", "FLT-F3S", "white", 2, "home", "Kite Filter F3S 2-pack", "Kite Filter F3S 滤芯 2 件装", 99],
  ["P012", "aster", "AUR-420", "silver", 1, "audio", "Aster AUR-420 Headphones Silver", "Aster AUR-420 银色头戴耳机", 899],
  ["P013", "nori", "MOUSE-M6", "black", 1, "computing", "Nori Mouse M6", "Nori Mouse M6 无线鼠标", 159],
  ["P014", "morrow", "HUB-H4", "silver", 1, "computing", "Morrow Hub H4", "Morrow Hub H4 集线器", 299],
  ["P015", "vela", "CHG-G40", "white", 1, "outdoor", "Vela Charger G40 40W", "Vela Charger G40 40 瓦充电器", 149],
  ["P016", "kite", "KTL-K8", "beige", 1, "home", "Kite Kettle K8", "Kite Kettle K8 电热水壶", 239],
  ["P017", "kite", "LMP-L5", "black", 1, "home", "Kite Lamp L5", "Kite Lamp L5 阅读灯", 169],
  ["P018", "morrow", "BTL-B24", "blue", 1, "outdoor", "Morrow Bottle B24", "Morrow Bottle B24 保温杯", 119],
  ["P019", "aster", "SPK-S9", "black", 1, "audio", "Aster Speaker S9", "Aster Speaker S9 音箱", 599],
  ["P020", "nori", "EAR-E3", "pink", 1, "audio", "Nori Earbuds E3", "Nori Earbuds E3 耳机", 299],
  ["P021", "vela", "KBD-K2", "green", 1, "computing", "Vela Keyboard K2", "Vela Keyboard K2 键盘", 279],
  ["P022", "morrow", "FLT-A7", "white", 1, "home", "Morrow Filter A7", "Morrow Filter A7 滤芯", 89],
  ["P023", "kite", "DOCK-D7", "black", 1, "computing", "Kite Dock D7", "Kite Dock D7 扩展坞", 389],
  ["P024", "aster", "BTL-A16", "silver", 1, "outdoor", "Aster Bottle A16", "Aster Bottle A16 运动水杯", 109],
  ["P025", "nori", "LMP-N9", "white", 1, "home", "Nori Lamp N9", "Nori Lamp N9 台灯", 159],
  ["P026", "morrow", "MOUSE-M3", "blue", 1, "computing", "Morrow Mouse M3", "Morrow Mouse M3 鼠标", 129],
  ["P027", "vela", "PUR-V5", "beige", 1, "home", "Vela Purifier V5", "Vela Purifier V5 空气净化器", 699],
  ["P028", "kite", "PWR-P12", "black", 1, "outdoor", "Kite Power Bank P12", "Kite Power Bank P12 充电宝", 229],
  ["P029", "aster", "HUB-A5", "silver", 1, "computing", "Aster Hub A5", "Aster Hub A5 集线器", 349],
  ["P030", "nori", "KTL-N4", "green", 1, "home", "Nori Kettle N4", "Nori Kettle N4 电热水壶", 219],
];

export const PRODUCTS = PRODUCT_SEEDS.map(([id, brand, model, variant, packSize, category, nameEn, nameZh, basePrice]) => ({
  id,
  brand,
  model,
  variant,
  packSize,
  basis: "retail",
  category,
  nameEn,
  nameZh,
  basePrice,
  synthetic: true,
}));

const SOURCE_PRICE_FACTOR = { alpha: 1.015, beta: 0.965, gamma: 1.03 };
const SOURCE_CONFIDENCE = { alpha: 0.97, beta: 0.93, gamma: 0.86 };
const SOURCE_DAY = { alpha: 23, beta: 22, gamma: 21 };
const SOURCE_HOUR = { alpha: 9, beta: 14, gamma: 18 };
const SOURCE_PATH = { alpha: "listing", beta: "offer", gamma: "catalog" };

function sourceTitle(product, sourceId) {
  const pack = product.packSize > 1 ? ` ${product.packSize}-pack` : "";
  if (sourceId === "alpha") return `${product.brand} ${product.model} — ${product.nameEn}${pack} — ${product.variant}`;
  if (sourceId === "beta") return `${product.brand.toUpperCase()} ${product.model} ${product.nameZh} ${product.variant}`;
  return `${product.brand} ${product.model} / ${product.variant} / ${product.nameEn.replace(product.brand, "").trim()}${pack}`;
}

export const OBSERVATIONS = PRODUCTS.flatMap((product) =>
  SOURCES.map((source) => {
    let title = sourceTitle(product, source.id);
    let confidence = SOURCE_CONFIDENCE[source.id];
    if (product.id === "P007" && source.id === "beta") {
      title = "Morrow warm table lamp beige";
      confidence = 0.68;
    }
    if (product.id === "P003" && source.id === "gamma") confidence = 0.71;
    if (product.id === "P016" && source.id === "gamma") confidence = 0.74;
    if (product.id === "P023" && source.id === "alpha") title += " — sale";
    const priceDelta = product.id === "P009" && source.id === "gamma" ? 58 : product.id === "P006" && source.id === "beta" ? -72 : 0;
    return {
      id: `O-${product.id}-${source.id}`,
      sourceId: source.id,
      title,
      rawSku: `${product.brand}-${product.model}-${product.variant}-${product.packSize}`.toUpperCase(),
      price: {
        amount: Math.round(product.basePrice * SOURCE_PRICE_FACTOR[source.id] + priceDelta),
        currency: FIXTURE_META.currency,
      },
      packSize: product.packSize,
      basis: product.id === "P023" && source.id === "alpha" ? "sale" : "retail",
      observedAt: `2026-11-${String(SOURCE_DAY[source.id]).padStart(2, "0")}T${String(SOURCE_HOUR[source.id]).padStart(2, "0")}:20:00.000Z`,
      confidence,
      url: `${source.url}/${SOURCE_PATH[source.id]}/${product.id.toLowerCase()}`,
      note: {
        en: source.id === "gamma" ? "Synthetic partial-field listing" : "Synthetic listing snapshot",
        zh: source.id === "gamma" ? "合成的不完整字段商品记录" : "合成商品快照",
      },
    };
  }),
);

const HISTORY_DAYS = ["2026-10-04", "2026-10-18", "2026-11-01", "2026-11-08", "2026-11-15", "2026-11-22"];

export const HISTORY = PRODUCTS.flatMap((product, productIndex) =>
  SOURCES.flatMap((source, sourceIndex) =>
    HISTORY_DAYS.map((day, dayIndex) => {
      const wave = Math.sin((productIndex + 1) * 0.7 + dayIndex * 1.1 + sourceIndex) * 0.035;
      const step = sourceIndex === 2 ? 0.025 : -0.008 * sourceIndex;
      return {
        id: `H-${product.id}-${source.id}-${day}`,
        productId: product.id,
        sourceId: source.id,
        observedAt: `${day}T08:00:00.000Z`,
        price: {
          amount: Math.round(product.basePrice * (1 + wave + step + dayIndex * 0.004) * 100) / 100,
          currency: FIXTURE_META.currency,
        },
        basis: "retail",
        synthetic: true,
      };
    }),
  ),
);

const POSITIVE_PROBES = [
  ["B001", "Aster AUR420 black headphones", "P001"],
  ["B002", "ASTER AUR-T2 white earbuds", "P002"],
  ["B003", "Aster HALO-M1 blue mini speaker", "P003"],
  ["B004", "Nori KBD68 white mechanical keyboard", "P004"],
  ["B005", "Morrow Dock D12 silver USB-C hub", "P006"],
  ["B006", "Vela BTL-V8 green 750ml bottle", "P008"],
  ["B007", "Vela CELL-C20 blue power bank", "P009"],
  ["B008", "Kite PUR-F3 white air purifier", "P010"],
  ["B009", "Kite FLT-F3S white filter 2-pack", "P011"],
  ["B010", "Nori MOUSE M6 black wireless mouse", "P013"],
  ["B011", "Vela CHG-G40 white 40W charger", "P015"],
  ["B012", "Aster SPK-S9 black speaker", "P019"],
  ["B013", "Kite PWR-P12 black power bank", "P028"],
  ["B014", "Morrow warm desk lamp beige", "P007"],
  ["B015", "Nori desk lamp white", "P025"],
];

const NEGATIVE_PROBES = [
  ["B016", "Aster AUR-42Q black headphones", null, "One-character model typo; deliberately ambiguous."],
  ["B017", "Nori KBD-68 2-pack white keyboard", null, "Wrong pack size."],
  ["B018", "Vela BTL-V8 green bottle refurbished", null, "Different condition basis."],
  ["B019", "Unknown ZX-900 black speaker", null, "Unknown brand and model."],
  ["B020", "Morrow Dock D12 black USB-C hub", null, "Wrong color variant."],
];

export const BLIND_CASES = [
  ...POSITIVE_PROBES.map(([id, title, expectedProductId]) => ({
    id,
    title,
    expectedProductId,
    expectedNote: { en: "Known synthetic SKU", zh: "已知合成 SKU" },
    synthetic: true,
  })),
  ...NEGATIVE_PROBES.map(([id, title, expectedProductId, expectedNote]) => ({
    id,
    title,
    expectedProductId,
    expectedNote: { en: expectedNote, zh: "构造的难例或负例" },
    synthetic: true,
  })),
];

export function createFixture() {
  return {
    meta: structuredClone(FIXTURE_META),
    sources: structuredClone(SOURCES),
    products: structuredClone(PRODUCTS),
    observations: structuredClone(OBSERVATIONS),
    history: structuredClone(HISTORY),
    blindCases: structuredClone(BLIND_CASES),
  };
}
