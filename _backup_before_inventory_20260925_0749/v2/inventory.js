/**
 * Inventory Forecasting & Reorder
 *
 * For every ferro-alloy and charge material: how much is usable, how fast the
 * melt shop uses it (exponentially smoothed history, or the planned heats if
 * that is higher), when it runs out, the safety stock and reorder point, the
 * economic order quantity, and which supplier to buy from (Supplier Scorecard).
 *
 * Uses only data already in the system: lots + stock ledger (CHARGE movements
 * at furnace start and alloy deductions when a strategy is accepted), planned
 * heats and the gate's suggested additions. Numbers are illustrative defaults.
 */
const store = require('./store');
const scorecard = require('./supplierScorecard');
const purchaseRequests = require('./purchaseRequests');
const { MATERIAL_TYPES, settings: gateSettings } = require('./config');

const DAY = 24 * 3600 * 1000;

// ------------------------------------------------------------ items + settings
const ITEMS = [
  { key: 'FeSi-75', label: 'FeSi-75', group: 'ALLOY', materialType: 'FERROALLOY', alloyName: 'FeSi-75', note: 'Raises silicon' },
  { key: 'HC FeMn', label: 'HC FeMn', group: 'ALLOY', materialType: 'FERROALLOY', alloyName: 'HC FeMn', note: 'Raises manganese' },
  { key: 'Recarburiser', label: 'Recarburiser', group: 'ALLOY', materialType: 'FERROALLOY', alloyName: 'Recarburiser', note: 'Raises carbon' },
  { key: 'STEEL_SCRAP', label: 'Steel scrap', group: 'CHARGE', materialType: 'STEEL_SCRAP' },
  { key: 'CI_SCRAP', label: 'Cast iron scrap', group: 'CHARGE', materialType: 'CI_SCRAP' },
  { key: 'PIG_IRON', label: 'Pig iron', group: 'CHARGE', materialType: 'PIG_IRON' },
  { key: 'DRI', label: 'Sponge iron (DRI)', group: 'CHARGE', materialType: 'DRI' },
  { key: 'RETURNS', label: 'Foundry returns', group: 'CHARGE', materialType: 'RETURNS', inHouse: true },
];

const settings = {
  serviceLevel: 0.95,
  horizonDays: 14,
  alpha: 0.3,
  historyDays: 30,
  overstockDays: 60,
  // Planned heats are expected to run within this many days (their kg above the normal run-rate is "extra" demand).
  plannedRunDays: 1,
  // Restricted lots: counted only up to their charge limit over the forecast horizon.
  // Sponge iron quality warnings.
  driMaxAgeDays: gateSettings?.driMaxAgeDays ?? 7,
  wetMoisturePct: gateSettings?.driRules?.wetMoisturePct ?? 1,
  notUsableWarnShare: 0.3,
  items: {
    'FeSi-75': { leadDays: 5, orderCostRs: 1500, holdingPct: 18, minOrderKg: 100, roundKg: 50 },
    'HC FeMn': { leadDays: 5, orderCostRs: 1500, holdingPct: 18, minOrderKg: 100, roundKg: 50 },
    Recarburiser: { leadDays: 3, orderCostRs: 1000, holdingPct: 18, minOrderKg: 50, roundKg: 50 },
    STEEL_SCRAP: { leadDays: 2, orderCostRs: 2500, holdingPct: 12, minOrderKg: 5000, roundKg: 500 },
    CI_SCRAP: { leadDays: 3, orderCostRs: 2500, holdingPct: 12, minOrderKg: 3000, roundKg: 500 },
    PIG_IRON: { leadDays: 4, orderCostRs: 2500, holdingPct: 12, minOrderKg: 3000, roundKg: 500 },
    DRI: { leadDays: 3, orderCostRs: 2500, holdingPct: 12, minOrderKg: 3000, roundKg: 500 },
    RETURNS: { leadDays: 0, orderCostRs: 0, holdingPct: 0, minOrderKg: 0, roundKg: 100 },
  },
  // Alloy use for a planned heat that has no alloy line and no gate suggestion yet (kg per tonne of charge).
  typicalAlloyKgPerT: {
    'SG-IRON': { 'FeSi-75': 12, 'HC FeMn': 5, Recarburiser: 6 },
    'GREY-IRON': { 'FeSi-75': 8, 'HC FeMn': 4, Recarburiser: 10 },
    'LOW-CARBON-STEEL': { 'FeSi-75': 3, 'HC FeMn': 8, Recarburiser: 2 },
    'MEDIUM-CARBON-STEEL': { 'FeSi-75': 3, 'HC FeMn': 9, Recarburiser: 4 },
    'HIGH-CARBON-STEEL': { 'FeSi-75': 3, 'HC FeMn': 10, Recarburiser: 8 },
  },
};

const round = (v, dp = 0) => (v === null || v === undefined || !Number.isFinite(v) ? null : Math.round(v * 10 ** dp) / 10 ** dp);
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const stdev = (xs) => { if (xs.length < 2) return 0; const m = mean(xs); return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1)); };
const itemOf = (key) => ITEMS.find((i) => i.key === key) || null;
const lotMatches = (item, lot) => lot.materialType === item.materialType && (!item.alloyName || lot.alloyName === item.alloyName);
const dayStart = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d; };
const fmtDate = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

// z for a one-sided service level (Acklam's inverse normal, good to ~1e-9).
function zFor(p) {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const q = Math.min(Math.max(p, 0.5), 0.9999);
  if (q > 1 - 0.02425) {
    const r = Math.sqrt(-2 * Math.log(1 - q));
    return -(((((c[0] * r + c[1]) * r + c[2]) * r + c[3]) * r + c[4]) * r + c[5]) / ((((d[0] * r + d[1]) * r + d[2]) * r + d[3]) * r + 1);
  }
  const x = q - 0.5; const r = x * x;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * x / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

// ------------------------------------------------------------ building blocks
function consumptionSeries(item, days = settings.historyDays) {
  const today = dayStart(Date.now());
  const from = new Date(today.getTime() - days * DAY);
  const lotIds = new Set(store.listLots().filter((l) => lotMatches(item, l)).map((l) => l.lotId));
  const byDay = new Array(days).fill(0);
  store.listMovements().forEach((m) => {
    if (m.type !== 'CHARGE' || !(m.kg < 0) || !lotIds.has(m.lotId)) return;
    const at = new Date(m.at);
    if (at < from || at >= today) return;
    const idx = Math.floor((at - from) / DAY);
    if (idx >= 0 && idx < days) byDay[idx] += -m.kg;
  });
  return byDay.map((kg, i) => ({ date: new Date(from.getTime() + i * DAY), kg: round(kg, 1) }));
}

/** Exponential smoothing: F(t+1) = α·D(t) + (1 − α)·F(t), started from the first week's mean. */
function smooth(values, alpha = settings.alpha) {
  if (!values.length) return { forecast: 0, series: [] };
  let f = mean(values.slice(0, Math.min(7, values.length)));
  const series = [];
  values.forEach((v) => { series.push(f); f = alpha * v + (1 - alpha) * f; });
  return { forecast: f, series };
}

/** Planned heats: kg of this item in their charge, the gate's suggested additions, or (alloys) typical use for the grade. */
function plannedDemand(item) {
  const sources = [];
  store.heats.list().filter((h) => h.status === 'PLANNED').forEach((h) => {
    const lines = (h.charge || []).map((l) => ({ ...l, lot: store.getLot(l.lotId) })).filter((l) => l.lot);
    const chargeT = lines.filter((l) => l.lot.materialType !== 'FERROALLOY').reduce((s, l) => s + Number(l.kg), 0) / 1000;
    const inCharge = lines.filter((l) => lotMatches(item, l.lot)).reduce((s, l) => s + Number(l.kg), 0);
    if (inCharge > 0) {
      sources.push({ heatId: h.heatId, grade: h.grade, kg: round(inCharge, 1), source: 'Charge plan' });
      return;
    }
    if (item.group !== 'ALLOY') return;
    const sug = (h.gate?.suggestedAdditions || []).filter((a) => a.alloyName === item.alloyName && a.kg > 0).reduce((s, a) => s + a.kg, 0);
    if (sug > 0) {
      sources.push({ heatId: h.heatId, grade: h.grade, kg: round(sug, 1), source: 'Gate suggested addition' });
      return;
    }
    const perT = settings.typicalAlloyKgPerT[String(h.grade).toUpperCase()]?.[item.alloyName] || 0;
    const t = chargeT || (Number(h.targetKg) || 0) / 1000;
    if (perT > 0 && t > 0) sources.push({ heatId: h.heatId, grade: h.grade, kg: round(perT * t, 1), source: `Typical for ${h.grade} (${perT} kg/t × ${round(t, 2)} t)` });
  });
  return { kg: round(sources.reduce((s, x) => s + x.kg, 0), 1), sources };
}

function lotAgeDays(lot) {
  const qa = store.qa.list(lot.lotId).find((q) => q.status === 'APPROVED');
  const ref = lot.materialType === 'DRI' && qa ? new Date(qa.testedAt) : new Date(lot.receivedAt);
  return (Date.now() - ref.getTime()) / DAY;
}

// Total charge melted per day (all charge materials), used to cap restricted lots.
function plantChargePerDay() {
  return ITEMS.filter((i) => i.group === 'CHARGE').reduce((s, it) => s + smooth(consumptionSeries(it).map((d) => d.kg)).forecast, 0);
}

// ------------------------------------------------------------ forecast for one item
function forecastItem(item, ctx = {}) {
  const cfg = settings.items[item.key];
  // Rounded up to 2 decimals, as in z-tables (95% → 1.65).
  const z = Math.ceil(zFor(settings.serviceLevel) * 100) / 100;
  const H = settings.horizonDays;

  // Step 1: usable stock
  const hist = consumptionSeries(item);
  const values = hist.map((d) => d.kg);
  const sm = smooth(values);
  const planned = plannedDemand(item);
  const plannedPerDay = planned.kg / H;
  const dailyDemand = Math.max(sm.forecast, plannedPerDay);
  const demandBasis = dailyDemand === 0 ? 'none' : sm.forecast >= plannedPerDay ? 'history' : 'planned';

  const chargePerDay = ctx.chargePerDay ?? plantChargePerDay();
  const lots = store.listLots().filter((l) => lotMatches(item, l) && store.availableKg(l.lotId) > 0.05)
    .sort((a, b) => new Date(a.receivedAt) - new Date(b.receivedAt));
  let usableKg = 0;
  let notUsableKg = 0;
  let valueRs = 0;
  const notUsableByStatus = {};
  const lotRows = lots.map((l) => {
    const avail = store.availableKg(l.lotId);
    let counted = 0;
    let note = null;
    if (l.status === 'RELEASED') counted = avail;
    else if (l.status === 'RESTRICTED') {
      const share = (l.restriction?.maxSharePct || 20) / 100;
      const base = item.group === 'ALLOY' ? dailyDemand : chargePerDay;
      const cap = share * base * H;
      counted = Math.min(avail, cap);
      note = counted < avail ? `Restricted: max ${Math.round(share * 100)}% of ${item.group === 'ALLOY' ? 'additions' : 'a charge'} — ${round(counted, 0)} of ${round(avail, 0)} kg counted over ${H} days` : `Restricted: max ${Math.round(share * 100)}% of ${item.group === 'ALLOY' ? 'additions' : 'a charge'}`;
    } else {
      notUsableByStatus[l.status] = (notUsableByStatus[l.status] || 0) + avail;
      note = l.status === 'AWAITING_QA' ? (l.materialType === 'DRI' ? 'Waiting for the QA lab result' : 'Waiting for yard gun inspection') : l.statusReason;
    }
    usableKg += counted;
    notUsableKg += avail - counted;
    valueRs += counted * (Number(l.costPerKg) || 0);
    const age = lotAgeDays(l);
    return {
      lotId: l.lotId, supplier: l.supplier, status: l.status, receivedAt: l.receivedAt, ageDays: round(age, 1),
      availableKg: round(avail, 1), countedKg: round(counted, 1), costPerKg: l.costPerKg, note,
      moisture: l.tested?.moisture ?? null,
      warning: item.materialType === 'DRI' && ['RELEASED', 'RESTRICTED'].includes(l.status) && age > settings.driMaxAgeDays ? `${round(age, 0)} days since lab test — re-oxidation: use first or re-test` : null,
    };
  });

  // Step 2–5: demand
  const sigmaHist = stdev(values);
  const useDays = values.filter((v) => v > 0).length;
  const lowHistory = useDays < 5;
  const sigma = lowHistory ? 0.3 * dailyDemand : sigmaHist;
  const L = cfg.leadDays;
  const safetyStock = z * sigma * Math.sqrt(L);
  const rop = dailyDemand * L + safetyStock;
  // Planned heats above the normal run-rate are extra, known demand: they come off the stock first.
  const extraCommittedKg = Math.max(0, planned.kg - sm.forecast * settings.plannedRunDays);
  const netKg = usableKg - extraCommittedKg;

  // Step 8: order quantity
  const lastPrice = lots.length ? Number(lots[lots.length - 1].costPerKg) || null : null;
  const refPrice = lastPrice || Number(store.listLots().filter((l) => lotMatches(item, l)).sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))[0]?.costPerKg) || null;
  const annualDemand = dailyDemand * 365;
  const holdingPerKgYear = refPrice ? (cfg.holdingPct / 100) * refPrice : null;
  const eoq = holdingPerKgYear && annualDemand > 0 ? Math.sqrt((2 * annualDemand * cfg.orderCostRs) / holdingPerKgYear) : 0;
  const shortfall = Math.max(0, rop - netKg + dailyDemand * L);
  let orderKg = Math.max(eoq, cfg.minOrderKg, shortfall);
  orderKg = Math.ceil(orderKg / cfg.roundKg) * cfg.roundKg;

  // Step 9: cover and stock-out
  const coverDays = dailyDemand > 0 ? Math.max(0, netKg) / dailyDemand : null;
  const stockOutAt = coverDays !== null ? new Date(Date.now() + coverDays * DAY) : null;

  // Step 10: status
  let status;
  let statusReason;
  if (dailyDemand <= 0.01) { status = 'NO_DEMAND'; statusReason = 'No use in the last 30 days and no planned heats'; }
  else if (!item.inHouse && (coverDays < L + 1 || netKg < safetyStock)) {
    status = 'CRITICAL';
    statusReason = netKg <= 0 ? 'No usable stock left after the planned heats'
      : coverDays < L + 1 ? `Runs out on ${fmtDate(stockOutAt)} — before a new delivery can arrive (lead time ${L} day${L === 1 ? '' : 's'})`
        : `Below safety stock (${round(netKg, 0)} of ${round(safetyStock, 0)} kg)`;
  } else if (item.inHouse && coverDays < 2) { status = 'CRITICAL'; statusReason = 'Returns run out in under 2 days — plan heats that generate returns'; }
  else if (!item.inHouse && netKg <= rop) { status = 'REORDER'; statusReason = `At or below the reorder point (${round(netKg, 0)} ≤ ${round(rop, 0)} kg) — order now to arrive in ${L} days`; }
  else if (coverDays > settings.overstockDays) { status = 'OVERSTOCK'; statusReason = `${round(coverDays, 0)} days of cover — cash tied up in stock`; }
  else { status = 'OK'; statusReason = `Above the reorder point; ${round(coverDays, 1)} days of cover`; }

  // Step 11: quality warnings
  const warnings = [];
  const onHand = usableKg + notUsableKg;
  if (notUsableKg > 0 && onHand > 0 && notUsableKg / onHand >= settings.notUsableWarnShare) {
    const parts = Object.entries(notUsableByStatus).map(([st, kg]) => `${round(kg, 0).toLocaleString('en-IN')} kg ${st.replace('_', ' ').toLowerCase()}`).join(', ');
    warnings.push({ level: 'warning', text: `Stock looks fine on paper (${round(onHand, 0).toLocaleString('en-IN')} kg), but ${round(notUsableKg, 0).toLocaleString('en-IN')} kg isn't usable yet: ${parts}.` });
  }
  lotRows.filter((l) => l.warning).forEach((l) => warnings.push({ level: 'warning', text: `${l.lotId}: ${l.warning}` }));
  if (item.materialType === 'DRI') {
    lots.filter((l) => ['RELEASED', 'RESTRICTED'].includes(l.status) && ((l.tested?.moisture ?? 0) > settings.wetMoisturePct || l.storage?.wet))
      .forEach((l) => warnings.push({ level: 'warning', text: `${l.lotId}: wet sponge iron (moisture ${l.tested?.moisture ?? '>1'}%) — costs melt energy and re-oxidises; dry or cover it` }));
  }
  if (lowHistory && dailyDemand > 0) warnings.push({ level: 'info', text: 'Little use history — safety stock uses 30% of daily demand as the variation.' });

  // Step 12: supplier
  let supplier = null;
  if (!item.inHouse) {
    try {
      const best = scorecard.bestSupplierFor(item.materialType, item.alloyName);
      if (best) {
        const theirLots = store.listLots().filter((l) => lotMatches(item, l) && l.supplier?.trim() === best.supplier).sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
        const price = Number(theirLots[0]?.costPerKg) || refPrice;
        supplier = { name: best.supplier, grade: best.grade, score: best.score, rank: best.rank, rankOf: best.rankOf, effectiveRsPerT: best.effectiveRsPerT, invoiceRsPerT: best.invoiceRsPerT, lastRsPerKg: price };
      }
    } catch { supplier = null; }
  }
  const openPr = purchaseRequests.openFor(item.key);

  return {
    item: item.key, label: item.label, group: item.group, materialType: item.materialType, alloyName: item.alloyName || null, note: item.note || null,
    inHouse: !!item.inHouse,
    usableKg: round(usableKg, 1), notUsableKg: round(notUsableKg, 1), notUsableByStatus, onHandKg: round(onHand, 1),
    valueRs: round(valueRs, 0),
    smoothedKgPerDay: round(sm.forecast, 1), plannedKg: planned.kg, plannedKgPerDay: round(plannedPerDay, 1),
    dailyDemandKg: round(dailyDemand, 1), demandBasis,
    sigmaKg: round(sigma, 1), lowHistory,
    leadDays: L, z: round(z, 2),
    safetyStockKg: round(safetyStock, 0), reorderPointKg: round(rop, 0),
    extraCommittedKg: round(extraCommittedKg, 1), netKg: round(netKg, 1),
    eoqKg: round(eoq, 0), orderKg: item.inHouse ? null : orderKg,
    coverDays: round(coverDays, 1), stockOutAt,
    status, statusReason, warnings,
    supplier,
    estTotalRs: supplier?.lastRsPerKg && !item.inHouse ? round(orderKg * supplier.lastRsPerKg, 0) : null,
    openPr: openPr ? { prId: openPr.prId, status: openPr.status, qtyKg: openPr.qtyKg, supplier: openPr.supplier } : null,
    // internals for the detail view
    _hist: hist, _smooth: sm.series, _lots: lotRows, _planned: planned, _cfg: cfg, _refPrice: refPrice, _annual: annualDemand, _holding: holdingPerKgYear, _shortfall: shortfall,
  };
}

const publicView = (f) => Object.fromEntries(Object.entries(f).filter(([k]) => !k.startsWith('_')));

function forecastAll() {
  const chargePerDay = plantChargePerDay();
  const items = ITEMS.map((it) => publicView(forecastItem(it, { chargePerDay })));
  const order = { CRITICAL: 0, REORDER: 1, OK: 2, OVERSTOCK: 3, NO_DEMAND: 4 };
  const upcoming = items.filter((i) => i.stockOutAt && !i.inHouse).sort((a, b) => new Date(a.stockOutAt) - new Date(b.stockOutAt));
  return {
    generatedAt: new Date(),
    settings: { serviceLevel: settings.serviceLevel, z: Math.ceil(zFor(settings.serviceLevel) * 100) / 100, horizonDays: settings.horizonDays, alpha: settings.alpha },
    summary: {
      critical: items.filter((i) => i.status === 'CRITICAL').length,
      reorder: items.filter((i) => i.status === 'REORDER').length,
      nextStockOut: upcoming[0] ? { item: upcoming[0].item, label: upcoming[0].label, at: upcoming[0].stockOutAt, coverDays: upcoming[0].coverDays } : null,
      stockValueRs: round(items.reduce((s, i) => s + (i.valueRs || 0), 0), 0),
      openPrs: purchaseRequests.list().filter((p) => purchaseRequests.OPEN.includes(p.status)).length,
    },
    items: items.sort((a, b) => (a.group === b.group ? order[a.status] - order[b.status] : a.group === 'ALLOY' ? -1 : 1)),
  };
}

/** Full detail: history + projection series and the step-by-step calculation. */
function forecastDetail(key) {
  const item = itemOf(key);
  if (!item) throw Object.assign(new Error(`Unknown item ${key}. Items: ${ITEMS.map((i) => i.key).join(', ')}`), { status: 404 });
  const f = forecastItem(item);
  const H = settings.horizonDays;

  // 30 days of stock on hand (all lots of this item, end of each day).
  const lotIds = new Set(store.listLots().filter((l) => lotMatches(item, l)).map((l) => l.lotId));
  const moves = store.listMovements().filter((m) => lotIds.has(m.lotId)).map((m) => ({ at: new Date(m.at).getTime(), kg: m.kg }));
  const today = dayStart(Date.now());
  const history = [];
  for (let i = settings.historyDays; i >= 1; i--) {
    const end = today.getTime() - (i - 1) * DAY;
    history.push({ date: new Date(end - DAY), onHandKg: round(moves.filter((m) => m.at < end).reduce((s, m) => s + m.kg, 0), 0), usedKg: f._hist[settings.historyDays - i]?.kg ?? 0 });
  }
  // 14 days projected usable stock.
  const projection = [];
  for (let k = 0; k <= H; k++) {
    const committed = f.extraCommittedKg * Math.min(1, k / settings.plannedRunDays);
    projection.push({ date: new Date(Date.now() + k * DAY), day: k, projectedKg: round(Math.max(0, f.usableKg - committed - f.dailyDemandKg * k), 0) });
  }

  const n = (v, dp = 0) => (v === null || v === undefined ? '—' : Number(round(v, dp)).toLocaleString('en-IN'));
  const cfg = f._cfg;
  const steps = [
    { title: 'Usable stock', formula: 'Released lots + restricted lots (up to their charge limit)', calc: `${n(f.usableKg)} kg usable${f.notUsableKg ? ` · ${n(f.notUsableKg)} kg not usable yet` : ''}`, value: `${n(f.usableKg)} kg` },
    { title: 'Consumption history', formula: `CHARGE + alloy deductions per day, last ${settings.historyDays} days`, calc: `${n(f._hist.reduce((s, d) => s + d.kg, 0))} kg used on ${f._hist.filter((d) => d.kg > 0).length} days · average ${n(mean(f._hist.map((d) => d.kg)), 1)} kg/day · σ ${n(stdev(f._hist.map((d) => d.kg)), 1)}`, value: `${n(mean(f._hist.map((d) => d.kg)), 1)} kg/day` },
    { title: 'Smoothed demand', formula: `F(t+1) = α·D(t) + (1 − α)·F(t), α = ${settings.alpha}`, calc: `last day ${n(f._hist[f._hist.length - 1]?.kg, 1)} kg, previous forecast ${n(f._smooth[f._smooth.length - 1], 1)} → ${n(f.smoothedKgPerDay, 1)} kg/day`, value: `${n(f.smoothedKgPerDay, 1)} kg/day` },
    { title: 'Planned demand', formula: `Planned heats' kg ÷ ${H}-day horizon`, calc: `${n(f.plannedKg, 1)} kg for ${f._planned.sources.length} planned heat(s) ÷ ${H} = ${n(f.plannedKgPerDay, 1)} kg/day`, value: `${n(f.plannedKgPerDay, 1)} kg/day` },
    { title: 'Daily demand', formula: 'max(smoothed history, planned per day)', calc: `max(${n(f.smoothedKgPerDay, 1)}, ${n(f.plannedKgPerDay, 1)}) = ${n(f.dailyDemandKg, 1)} kg/day (${f.demandBasis === 'planned' ? 'planned heats' : f.demandBasis === 'history' ? 'history' : 'no demand'})`, value: `${n(f.dailyDemandKg, 1)} kg/day` },
    { title: 'Safety stock', formula: 'SS = z × σ_daily × √(lead time)', calc: `${f.z} × ${n(f.sigmaKg, 1)}${f.lowHistory ? ' (30% of demand — little history)' : ''} × √${f.leadDays} = ${n(f.safetyStockKg)} kg`, value: `${n(f.safetyStockKg)} kg` },
    { title: 'Reorder point', formula: 'ROP = daily demand × lead time + SS', calc: `${n(f.dailyDemandKg, 1)} × ${f.leadDays} + ${n(f.safetyStockKg)} = ${n(f.reorderPointKg)} kg`, value: `${n(f.reorderPointKg)} kg` },
    { title: 'Net stock after planned heats', formula: 'usable − planned kg above the normal run-rate', calc: `${n(f.usableKg)} − max(0, ${n(f.plannedKg, 1)} − ${n(f.smoothedKgPerDay, 1)} × ${settings.plannedRunDays} day) = ${n(f.netKg)} kg`, value: `${n(f.netKg)} kg` },
    { title: 'Order quantity (EOQ)', formula: 'EOQ = √(2 × annual demand × order cost ÷ holding cost per kg per year)', calc: f.inHouse ? 'Made in-house — not purchased' : `√(2 × ${n(f._annual)} × ₹${n(cfg.orderCostRs)} ÷ ₹${n(f._holding, 2)}) = ${n(f.eoqKg)} kg → at least min order ${n(cfg.minOrderKg)} kg and shortfall ${n(f._shortfall)} kg → ${n(f.orderKg)} kg (rounded to ${cfg.roundKg} kg)`, value: f.inHouse ? '—' : `${n(f.orderKg)} kg` },
    { title: 'Days of cover', formula: 'net stock ÷ daily demand', calc: f.coverDays === null ? 'No demand' : `${n(f.netKg)} ÷ ${n(f.dailyDemandKg, 1)} = ${n(f.coverDays, 1)} days → stock-out ${fmtDate(new Date(f.stockOutAt))}`, value: f.coverDays === null ? '—' : `${n(f.coverDays, 1)} days` },
  ];

  return {
    ...publicView(f),
    history,
    projection,
    steps,
    demandSources: f._planned.sources,
    lots: f._lots,
    settings: { ...cfg, serviceLevel: settings.serviceLevel, horizonDays: H, alpha: settings.alpha },
  };
}

function reorderSuggestions() {
  return forecastAll().items
    .filter((i) => ['CRITICAL', 'REORDER'].includes(i.status) && !i.inHouse && !i.openPr)
    .map((i) => ({
      item: i.item, label: i.label, materialType: i.materialType, alloyName: i.alloyName, status: i.status,
      qtyKg: i.orderKg, supplier: i.supplier?.name || null, supplierGrade: i.supplier?.grade || null, supplierScore: i.supplier?.score ?? null,
      effectiveRsPerT: i.supplier?.effectiveRsPerT ?? null, estRsPerKg: i.supplier?.lastRsPerKg ?? null, estTotalRs: i.estTotalRs,
      reason: i.statusReason, stockOutAt: i.stockOutAt, coverDays: i.coverDays,
    }));
}

/** Create a PR, pre-filled from the current forecast unless the caller overrides fields. */
function createPurchaseRequest(body = {}) {
  const item = itemOf(body.item);
  if (!item) throw Object.assign(new Error('item is required (e.g. FeSi-75, STEEL_SCRAP)'), { status: 400 });
  if (item.inHouse) throw Object.assign(new Error(`${item.label} are made in-house and are not purchased`), { status: 400 });
  const f = forecastItem(item);
  const supplierName = body.supplier || f.supplier?.name || null;
  let grade = f.supplier?.grade || null;
  let price = f.supplier?.lastRsPerKg || f._refPrice;
  if (body.supplier && body.supplier !== f.supplier?.name) {
    const idx = scorecard.gradeIndex();
    const g = idx[`${item.alloyName ? `FERROALLOY:${item.alloyName}` : item.materialType}::${body.supplier}`];
    grade = g?.grade || 'NEW';
    const theirs = store.listLots().filter((l) => lotMatches(item, l) && l.supplier?.trim() === body.supplier).sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))[0];
    price = Number(theirs?.costPerKg) || price;
  }
  return purchaseRequests.create({
    item: item.key, label: item.label, materialType: item.materialType, alloyName: item.alloyName || null,
    qtyKg: body.qtyKg || f.orderKg,
    supplier: supplierName, supplierGrade: grade,
    estRsPerKg: body.estRsPerKg || price,
    reason: body.reason || `${f.status === 'CRITICAL' ? 'Critical' : f.status === 'REORDER' ? 'Reorder point reached' : 'Manual request'}: ${f.statusReason}`,
    requestedBy: body.requestedBy,
  });
}

function getConfig() { return settings; }
function updateConfig(patch = {}) {
  const num = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
  ['serviceLevel', 'horizonDays', 'alpha', 'historyDays', 'overstockDays', 'plannedRunDays'].forEach((k) => {
    if (num(patch[k])) settings[k] = patch[k];
  });
  settings.serviceLevel = Math.min(0.999, Math.max(0.5, settings.serviceLevel));
  settings.alpha = Math.min(1, Math.max(0.01, settings.alpha));
  settings.horizonDays = Math.max(1, Math.round(settings.horizonDays));
  Object.entries(patch.items || {}).forEach(([key, p]) => {
    if (!settings.items[key]) return;
    ['leadDays', 'orderCostRs', 'holdingPct', 'minOrderKg', 'roundKg'].forEach((k) => { if (num(p?.[k])) settings.items[key][k] = p[k]; });
  });
  return settings;
}

/**
 * Demo calibration: set today's FeSi-75 stock just above its critical line
 * (orange, "reorder now"), so planning a couple more heats tips it into red.
 * Only adjusts the demo's current FeSi lot's received weight; runs after each seed.
 */
function calibrateDemo() {
  const lot = store.getLot('ALY-0903');
  if (!lot) return;
  const item = itemOf('FeSi-75');
  const f = forecastItem(item);
  if (!f.dailyDemandKg) return;
  const critical = Math.max(f.dailyDemandKg * (f.leadDays + 1), f.safetyStockKg);
  const target = Math.round(f.extraCommittedKg + (critical + f.reorderPointKg) / 2);
  const delta = target - f.usableKg;
  if (Math.abs(delta) < 1) return;
  const mv = store.listMovements(lot.lotId).find((m) => m.type === 'RECEIPT');
  const newReceived = Math.round(lot.receivedKg + delta);
  if (!mv || newReceived <= 0) return;
  lot.receivedKg = newReceived;
  mv.kg = newReceived;
  if (lot.invoiceKg) lot.invoiceKg = Math.round(newReceived * 1.004 / 10) * 10;
}
calibrateDemo();
store.onSeed(calibrateDemo);

module.exports = { ITEMS, settings, forecastAll, forecastDetail, reorderSuggestions, createPurchaseRequest, getConfig, updateConfig, zFor };
