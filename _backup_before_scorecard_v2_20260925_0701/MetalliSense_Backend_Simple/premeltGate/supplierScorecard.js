/**
 * Supplier Scorecard
 *
 * Ranks raw-material suppliers on the TRUE cost of good metal, not the
 * invoice price. Everything is computed from data the Pre-Melt Gate already
 * records: lots (declared vs tested chemistry, status, price, yield), handheld
 * gun sessions (flagged pieces), DRI QA results and heats (gate decisions).
 *
 * Suppliers are compared only within the same material type (scrap vs scrap,
 * DRI vs DRI …). Criteria with no data are skipped and the remaining weights
 * are re-normalised, so a supplier is never punished for missing data.
 */
const store = require('./store');
const { MATERIAL_TYPES } = require('./config');
const { lotChemistry } = require('./chemistry');

// ------------------------------------------------------------ settings
const settings = {
  weights: {
    acceptance: 25,
    accuracy: 15,
    contamination: 10,
    effectiveCost: 20,
    yield: 10,
    delivery: 10,
    heatImpact: 10,
  },
  // Handling / re-inspection / return cost of a lot that is not released (₹ per kg).
  // Cost of a rejected / restricted share: return freight, re-inspection, delay, replacement premium (₹ per kg).
  rejectHandlingRsPerKg: 10,
  // Minimum decided lots before a supplier gets a grade.
  minLotsForGrade: 3,
  grades: [
    { grade: 'A', min: 85, label: 'Preferred', inspectPieces: 10 },
    { grade: 'B', min: 70, label: 'Approved', inspectPieces: 15 },
    { grade: 'C', min: 50, label: 'Conditional', inspectPieces: 25 },
    { grade: 'D', min: 0, label: 'Blocked — manager approval', inspectPieces: 30 },
  ],
};

const CRITERIA = {
  acceptance: 'Acceptance rate',
  accuracy: 'Declaration accuracy',
  contamination: 'Clean pieces (gun)',
  effectiveCost: 'Effective cost',
  yield: 'Metal yield',
  delivery: 'Delivery reliability',
  heatImpact: 'Heat impact',
};

const ACCURACY_ELEMENTS = ['C', 'Si', 'Mn', 'P', 'S', 'Cu', 'Cr', 'Ni', 'feMetallic', 'feTotal'];
// Absolute floor (in % points) so tiny values do not blow up relative error.
const ACCURACY_FLOOR = { C: 0.05, Si: 0.05, Mn: 0.05, P: 0.01, S: 0.01, Cu: 0.02, Cr: 0.02, Ni: 0.02, feMetallic: 1, feTotal: 1 };

const round = (v, dp = 1) => (v === null || v === undefined || Number.isNaN(v) ? null : Math.round(v * 10 ** dp) / 10 ** dp);
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

// ------------------------------------------------------------ store adapters
// (tolerant of small differences in store.js accessor names)
function allHeats() {
  if (store.heats?.list) return store.heats.list();
  if (store.heats?.all) return store.heats.all();
  if (store.listHeats) return store.listHeats();
  return [];
}
function sessionsFor(lotId) {
  if (store.sessions?.list) return store.sessions.list(lotId) || [];
  if (store.sessions?.forLot) return store.sessions.forLot(lotId) || [];
  if (store.listSessions) return store.listSessions(lotId) || [];
  return [];
}
function approvedQa(lotId) {
  const list = store.qa?.list ? store.qa.list(lotId) : [];
  return list.filter((q) => q.status === 'APPROVED');
}

// ------------------------------------------------------------ per-lot facts
function lotFacts(lot) {
  const status = lot.status;
  const decided = !['AWAITING_QA', 'PROVISIONAL'].includes(status);
  let acceptance = null;
  if (decided) {
    if (status === 'RELEASED' || status === 'CONSUMED') acceptance = 1;
    else if (status === 'RESTRICTED') acceptance = 0.5;
    else acceptance = 0; // QUARANTINED, REJECTED
  }

  // Declaration accuracy: declared vs tested (lab), per element.
  let accuracy = null;
  const accuracyDetail = [];
  if (lot.declared && lot.tested && lot.chemistrySource === 'LAB') {
    const errs = [];
    ACCURACY_ELEMENTS.forEach((el) => {
      const d = Number(lot.declared[el]);
      const t = Number(lot.tested[el]);
      if (!Number.isFinite(d) || !Number.isFinite(t)) return;
      const rel = Math.abs(d - t) / Math.max(Math.abs(t), ACCURACY_FLOOR[el] || 0.05);
      errs.push(Math.min(rel, 1));
      accuracyDetail.push({ element: el, declared: d, tested: t, errorPct: round(rel * 100, 1) });
    });
    if (errs.length) accuracy = Math.max(0, 1 - mean(errs));
  }

  // Contamination from the handheld gun (latest session).
  let contamination = null;
  let gun = null;
  const sessions = sessionsFor(lot.lotId);
  const last = sessions[0] || null;
  if (last?.evidence?.piecesTested) {
    const e = last.evidence;
    const flagged = (e.cuHigh || 0) + (e.stainless || 0) + (e.alloySteel || 0);
    contamination = Math.max(0, 1 - flagged / e.piecesTested);
    gun = { piecesTested: e.piecesTested, flagged, surfaceBad: e.piecesTested - (e.reliable ?? e.piecesTested) };
  }

  // Yield: actual metal yield vs the nominal yield of its material type.
  let yieldRatio = null;
  let yieldPct = null;
  try {
    const chem = lotChemistry(lot);
    yieldPct = chem.yield * 100;
    const nominal = MATERIAL_TYPES[lot.materialType]?.yield ?? 0.92;
    yieldRatio = Math.min(1.05, chem.yield / nominal);
  } catch { /* lot without chemistry */ }

  // Delivery: on-time and weight match (only when those fields exist).
  let delivery = null;
  const parts = [];
  if (lot.promisedAt && lot.receivedAt) parts.push(new Date(lot.receivedAt) <= new Date(lot.promisedAt) ? 1 : 0);
  if (lot.invoiceKg && lot.receivedKg) parts.push(Math.max(0, 1 - Math.abs(lot.invoiceKg - lot.receivedKg) / lot.invoiceKg / 0.05));
  if (parts.length) delivery = mean(parts);

  return { acceptance, accuracy, accuracyDetail, contamination, gun, yieldRatio, yieldPct, delivery, decided };
}

// Heats that used each lot, and how the gate judged them.
function heatImpactByLot() {
  const map = {};
  allHeats().forEach((h) => {
    const decision = h.start?.gateDecision || h.gate?.decision || h.gateResult?.decision;
    if (!decision) return;
    (h.charge || []).forEach((line) => {
      map[line.lotId] = map[line.lotId] || [];
      map[line.lotId].push({ heatId: h.heatId, decision, overridden: h.start?.mode === 'ENGINEER_OVERRIDE' });
    });
  });
  return map;
}

// ------------------------------------------------------------ scorecard
function computeScorecard({ materialType } = {}) {
  const lots = store.listLots().filter((l) => l.supplier && l.materialType !== undefined && !/^in-house$/i.test(String(l.supplier).trim()));
  const heatMap = heatImpactByLot();

  // Group by (materialType, supplier)
  const groups = {};
  lots.forEach((lot) => {
    if (materialType && lot.materialType !== materialType) return;
    const key = `${lot.materialType}::${lot.supplier.trim()}`;
    groups[key] = groups[key] || { supplier: lot.supplier.trim(), materialType: lot.materialType, lots: [] };
    groups[key].lots.push(lot);
  });

  const suppliers = Object.values(groups).map((g) => {
    const facts = g.lots.map((l) => ({ lot: l, f: lotFacts(l) }));
    const decided = facts.filter((x) => x.f.acceptance !== null);
    const kgTotal = g.lots.reduce((s, l) => s + (Number(l.receivedKg) || 0), 0);

    const pick = (k) => facts.map((x) => x.f[k]).filter((v) => v !== null && v !== undefined);
    const acceptance = mean(decided.map((x) => x.f.acceptance));
    const accuracy = mean(pick('accuracy'));
    const contamination = mean(pick('contamination'));
    const yieldRatio = mean(pick('yieldRatio'));
    const delivery = mean(pick('delivery'));

    // Heat impact: share of heats using this supplier that were WARN / HOLD.
    const heats = [];
    g.lots.forEach((l) => (heatMap[l.lotId] || []).forEach((h) => heats.push(h)));
    const uniqHeats = Object.values(Object.fromEntries(heats.map((h) => [h.heatId, h])));
    const bad = uniqHeats.filter((h) => h.decision === 'HOLD' || h.decision === 'WARN').length;
    const holds = uniqHeats.filter((h) => h.decision === 'HOLD').length;
    const heatImpact = uniqHeats.length ? Math.max(0, 1 - (holds + 0.5 * (bad - holds)) / uniqHeats.length) : null;

    // Effective cost: ₹ per tonne of GOOD metal.
    const priced = g.lots.filter((l) => Number(l.costPerKg) > 0);
    let effectiveRsPerT = null;
    let invoiceRsPerT = null;
    let costParts = null;
    if (priced.length) {
      const wKg = priced.reduce((s, l) => s + (Number(l.receivedKg) || 1), 0);
      invoiceRsPerT = priced.reduce((s, l) => s + l.costPerKg * (Number(l.receivedKg) || 1), 0) / wKg * 1000;
      const y = yieldRatio !== null ? mean(pick('yieldPct')) / 100 : (MATERIAL_TYPES[g.materialType]?.yield ?? 0.92);
      const rejectShare = acceptance !== null ? 1 - acceptance : 0;
      effectiveRsPerT = invoiceRsPerT / Math.max(y, 0.3) + rejectShare * settings.rejectHandlingRsPerKg * 1000;
      costParts = {
        invoiceRsPerT: round(invoiceRsPerT, 0),
        yieldPct: round(y * 100, 1),
        yieldLossRsPerT: round(invoiceRsPerT / Math.max(y, 0.3) - invoiceRsPerT, 0),
        rejectSharePct: round(rejectShare * 100, 1),
        rejectPenaltyRsPerKg: settings.rejectHandlingRsPerKg,
        rejectCostRsPerT: round(rejectShare * settings.rejectHandlingRsPerKg * 1000, 0),
        effectiveRsPerT: round(effectiveRsPerT, 0),
      };
    }

    const statusCounts = g.lots.reduce((m, l) => ({ ...m, [l.status]: (m[l.status] || 0) + 1 }), {});
    const gunLots = facts.filter((x) => x.f.gun);
    const piecesTested = gunLots.reduce((a, x) => a + x.f.gun.piecesTested, 0);
    const piecesFlagged = gunLots.reduce((a, x) => a + x.f.gun.flagged, 0);
    const yList = pick('yieldPct');
    const evidence = {
      lotsTotal: g.lots.length,
      lotsDecided: decided.length,
      released: decided.filter((x) => x.f.acceptance === 1).length,
      restricted: decided.filter((x) => x.f.acceptance === 0.5).length,
      rejected: decided.filter((x) => x.f.acceptance === 0).length,
      labTestedLots: pick('accuracy').length,
      gunLots: gunLots.length,
      piecesTested,
      piecesFlagged,
      avgYieldPct: yList.length ? round(mean(yList), 1) : null,
      nominalYieldPct: MATERIAL_TYPES[g.materialType]?.yield ? round(MATERIAL_TYPES[g.materialType].yield * 100, 1) : null,
      deliveryLots: pick('delivery').length,
      heatsUsed: uniqHeats.length,
      heatsHold: holds,
      heatsWarn: bad - holds,
      heatList: uniqHeats.map((h) => ({ heatId: h.heatId, decision: h.decision })),
    };
    const perLot = facts.map(({ lot, f }) => ({
      lotId: lot.lotId,
      status: lot.status,
      receivedKg: lot.receivedKg,
      costPerKg: lot.costPerKg ?? null,
      acceptance: f.acceptance === null ? null : round(f.acceptance * 100, 0),
      accuracy: f.accuracy === null ? null : round(f.accuracy * 100, 0),
      gun: f.gun,
      yieldPct: f.yieldPct === null ? null : round(f.yieldPct, 1),
      heats: (heatMap[lot.lotId] || []).map((h) => `${h.heatId} ${h.decision}`),
    }));
    return {
      supplier: g.supplier,
      materialType: g.materialType,
      materialLabel: MATERIAL_TYPES[g.materialType]?.label || g.materialType,
      lots: g.lots.length,
      decidedLots: decided.length,
      receivedKg: round(kgTotal, 0),
      statusCounts,
      raw: { acceptance, accuracy, contamination, yield: yieldRatio, delivery, heatImpact },
      evidence,
      perLot,
      costBreakdown: costParts,
      invoiceRsPerT: round(invoiceRsPerT, 0),
      effectiveRsPerT: round(effectiveRsPerT, 0),
      heatsUsed: uniqHeats.length,
      heatsWarnOrHold: bad,
      accuracyDetail: facts.flatMap((x) => x.f.accuracyDetail.map((d) => ({ lotId: x.lot.lotId, ...d }))),
      lotList: g.lots.map((l) => ({ lotId: l.lotId, status: l.status, receivedAt: l.receivedAt, receivedKg: l.receivedKg, costPerKg: l.costPerKg, statusReason: l.statusReason })),
    };
  });

  // Effective cost is relative: cheapest good metal in its material type = 100.
  const byType = {};
  suppliers.forEach((s) => { (byType[s.materialType] = byType[s.materialType] || []).push(s); });
  Object.values(byType).forEach((list) => {
    const costs = list.map((s) => s.effectiveRsPerT).filter((v) => v !== null);
    const min = Math.min(...costs);
    list.forEach((s) => {
      // Ratio to the cheapest: 10 % dearer ≈ 91 points, 50 % dearer ≈ 67 points.
      s.raw.effectiveCost = s.effectiveRsPerT === null ? null : min / s.effectiveRsPerT;
    });
  });

  // Weighted score over available criteria.
  suppliers.forEach((s) => {
    let wSum = 0;
    let total = 0;
    s.criteria = Object.entries(CRITERIA).map(([key, label]) => {
      const v = s.raw[key];
      const w = settings.weights[key] || 0;
      if (v !== null && v !== undefined) { wSum += w; total += w * v; }
      return { key, label, weight: w, score: v === null || v === undefined ? null : round(v * 100, 0) };
    });
    s.score = wSum > 0 ? round((total / wSum) * 100, 0) : null;
    const e = s.evidence;
    const how = {
      acceptance: { evidence: `${e.released} released, ${e.restricted} restricted, ${e.rejected} quarantined/rejected of ${e.lotsDecided} decided lots`, formula: '(released + 0.5 × restricted) ÷ decided lots' },
      accuracy: { evidence: e.labTestedLots ? `${e.labTestedLots} lab-tested lot(s), ${s.accuracyDetail.length} element comparisons` : 'No lab-tested lots yet', formula: '1 − average |declared − tested| ÷ tested (per element, capped at 100%)' },
      contamination: { evidence: e.piecesTested ? `${e.piecesFlagged} flagged of ${e.piecesTested} gun-tested pieces (${e.gunLots} lot(s))` : 'No gun inspections yet', formula: '1 − flagged pieces ÷ tested pieces (Cu-high, stainless, alloy)' },
      effectiveCost: { evidence: s.effectiveRsPerT !== null ? `₹${s.effectiveRsPerT.toLocaleString('en-IN')}/t effective vs cheapest in ${s.materialLabel}` : 'No prices recorded', formula: 'cheapest effective ₹/t ÷ this supplier’s effective ₹/t' },
      yield: { evidence: e.avgYieldPct !== null ? `${e.avgYieldPct}% metal yield vs ${e.nominalYieldPct ?? '—'}% nominal` : 'No yield data', formula: 'actual yield ÷ nominal yield for the material' },
      delivery: { evidence: e.deliveryLots ? `${e.deliveryLots} lot(s) with promised date / invoice weight` : 'No promised dates or invoice weights recorded', formula: 'on-time share and invoice-vs-weighbridge weight match' },
      heatImpact: { evidence: e.heatsUsed ? `${e.heatsUsed} heat(s) used their lots: ${e.heatsHold} HOLD, ${e.heatsWarn} WARN` : 'Not used in any heat yet', formula: '1 − (HOLD + 0.5 × WARN) ÷ heats using their lots' },
    };
    s.criteria.forEach((c) => {
      Object.assign(c, how[c.key]);
      c.weightShare = c.score === null || wSum === 0 ? 0 : round((c.weight / wSum) * 100, 1);
      c.points = c.score === null || wSum === 0 ? null : round((c.weight / wSum) * c.score, 1);
    });
    s.coverage = round((wSum / Object.values(settings.weights).reduce((a, b) => a + b, 0)) * 100, 0);
    if (s.decidedLots < settings.minLotsForGrade) {
      s.grade = 'NEW';
      s.gradeLabel = `New supplier (${s.decidedLots}/${settings.minLotsForGrade} lots decided)`;
      s.inspectPieces = 25;
    } else {
      const g = settings.grades.find((x) => s.score >= x.min) || settings.grades[settings.grades.length - 1];
      s.grade = g.grade;
      s.gradeLabel = g.label;
      s.inspectPieces = g.inspectPieces;
    }
    delete s.raw;
  });

  // Rank within each material type.
  Object.values(byType).forEach((list) => {
    list.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    list.forEach((s, i) => { s.rank = i + 1; s.rankOf = list.length; });
    // Why this rank: compare with the supplier just above (or just below for #1).
    list.forEach((s, i) => {
      const other = i > 0 ? list[i - 1] : list[i + 1];
      if (!other || s.score === null || other.score === null) {
        s.rankReason = list.length === 1 ? `Only supplier of ${s.materialLabel} so far.` : null;
        return;
      }
      const diffs = s.criteria
        .map((c) => {
          const o = other.criteria.find((x) => x.key === c.key);
          return c.points === null || o?.points === null || o?.points === undefined ? null : { label: c.label, delta: round(c.points - o.points, 1) };
        })
        .filter(Boolean)
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
      const gap = round(s.score - other.score, 0);
      s.rankVs = { supplier: other.supplier, rank: other.rank, score: other.score, gap, diffs };
      const nonZero = diffs.filter((d) => Math.abs(d.delta) >= 0.1);
      const top = nonZero.length
        ? `Biggest differences: ${nonZero.slice(0, 2).map((d) => `${d.label} (${d.delta > 0 ? '+' : ''}${d.delta} pts)`).join(' and ')}.`
        : 'Equal on every criterion with data.';
      s.rankReason = i === 0
        ? `Ranked #1, ${gap} points ahead of ${other.supplier}. ${top}`
        : `Ranked #${s.rank}, ${Math.abs(gap)} points behind ${other.supplier}. ${top}`;
    });
  });

  suppliers.sort((a, b) => a.materialType.localeCompare(b.materialType) || a.rank - b.rank);
  return {
    generatedAt: new Date(),
    weights: settings.weights,
    grades: settings.grades,
    suppliers,
  };
}

function supplierDetail(name, materialType) {
  const card = computeScorecard({ materialType });
  return card.suppliers.find((s) => s.supplier.toLowerCase() === String(name).toLowerCase()) || null;
}

/** Grade of the supplier behind a lot — used to set inspection intensity. */
function gradeForLot(lot) {
  if (!lot?.supplier) return null;
  const s = supplierDetail(lot.supplier, lot.materialType);
  return s ? { grade: s.grade, score: s.score, inspectPieces: s.inspectPieces } : null;
}

/** Best-ranked supplier for a material / alloy — used by inventory reorder. */
function bestSupplierFor(materialType, alloyName) {
  const list = computeScorecard({ materialType }).suppliers;
  const filtered = alloyName
    ? list.filter((s) => store.listLots().some((l) => l.supplier?.trim() === s.supplier && l.alloyName === alloyName))
    : list;
  return filtered.find((s) => s.grade !== 'D') || null;
}

function updateWeights(patch = {}) {
  Object.entries(patch).forEach(([k, v]) => {
    if (k in settings.weights && Number(v) >= 0) settings.weights[k] = Number(v);
  });
  return settings.weights;
}

module.exports = { computeScorecard, supplierDetail, gradeForLot, bestSupplierFor, updateWeights, settings, CRITERIA };
