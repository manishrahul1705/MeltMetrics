import React, { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import toast from "react-hot-toast";
import {
  Trophy, Truck, ShieldCheck, IndianRupee, SlidersHorizontal, X, TrendingDown, AlertTriangle, RefreshCw,
} from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { MeltSpinner } from "../components/common/FurnaceLoader";
import { StatusPill, errMsg } from "../components/premelt/premeltUi";
import { getSupplierScorecard, updateSupplierWeights } from "../services/insightsService";

const GRADE_STYLE = {
  A: "bg-emerald-600 text-white",
  B: "bg-sky-600 text-white",
  C: "bg-amber-500 text-metal-950",
  D: "bg-red-700 text-white",
  NEW: "bg-metal-200 text-metal-700",
};
const TYPE_TABS = [
  ["", "All materials"],
  ["STEEL_SCRAP", "Steel scrap"],
  ["CI_SCRAP", "Cast iron scrap"],
  ["DRI", "Sponge iron"],
  ["PIG_IRON", "Pig iron"],
  ["FERROALLOY", "Ferro-alloys"],
  ["RETURNS", "Returns"],
];
const rs = (v) => (v === null || v === undefined ? "—" : `₹${Number(v).toLocaleString("en-IN")}`);
const scoreColor = (s) => (s === null ? "bg-metal-300" : s >= 85 ? "bg-emerald-500" : s >= 70 ? "bg-sky-500" : s >= 50 ? "bg-amber-500" : "bg-red-600");

function GradeBadge({ grade, big }) {
  return (
    <span className={clsx("inline-grid place-items-center font-black rounded-lg", big ? "w-12 h-12 text-2xl" : "w-8 h-8 text-sm", GRADE_STYLE[grade] || GRADE_STYLE.NEW)}>
      {grade === "NEW" ? "N" : grade}
    </span>
  );
}

function ScoreBar({ score }) {
  return (
    <div className="flex items-center gap-2 min-w-[8rem]">
      <div className="h-2 flex-1 rounded-full bg-metal-100 overflow-hidden">
        <div className={clsx("h-full rounded-full transition-all duration-700", scoreColor(score))} style={{ width: `${score ?? 0}%` }} />
      </div>
      <span className="w-8 text-right text-sm font-bold tabular-nums text-metal-900">{score ?? "—"}</span>
    </div>
  );
}

function WeightsEditor({ weights, onSaved, onClose }) {
  const [w, setW] = useState(weights);
  const total = Object.values(w).reduce((a, b) => a + Number(b || 0), 0);
  const LABELS = { acceptance: "Acceptance rate", accuracy: "Declaration accuracy", contamination: "Clean pieces (gun)", effectiveCost: "Effective cost", yield: "Metal yield", delivery: "Delivery reliability", heatImpact: "Heat impact" };
  const save = async () => {
    try {
      await updateSupplierWeights(w);
      toast.success("Weights updated — ranking recalculated");
      onSaved();
    } catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <Card title="Ranking weights" actions={<button onClick={onClose} className="p-1 text-metal-400 hover:text-metal-700" aria-label="Close"><X size={18} /></button>}>
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
        {Object.entries(LABELS).map(([k, label]) => (
          <label key={k} className="flex items-center gap-3 text-sm">
            <span className="w-44 text-metal-700 font-medium">{label}</span>
            <input type="range" min="0" max="40" value={w[k] ?? 0} onChange={(e) => setW({ ...w, [k]: Number(e.target.value) })} className="flex-1 accent-primary-600" />
            <span className="w-10 text-right tabular-nums font-bold">{w[k]}</span>
          </label>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-metal-500">Total {total}. Weights are re-normalised, so they do not need to add up to 100.</p>
        <Button size="sm" onClick={save}>Apply weights</Button>
      </div>
    </Card>
  );
}

function GradeScale({ score }) {
  const bands = [["D", 0, 50, "bg-red-200"], ["C", 50, 70, "bg-amber-200"], ["B", 70, 85, "bg-sky-200"], ["A", 85, 100, "bg-emerald-200"]];
  return (
    <div>
      <div className="relative h-3 flex rounded-full overflow-hidden">
        {bands.map(([g, lo, hi, cls]) => <div key={g} className={cls} style={{ width: `${hi - lo}%` }} />)}
        {score !== null && <div className="absolute -top-1 w-1 h-5 rounded bg-metal-900" style={{ left: `calc(${score}% - 2px)` }} />}
      </div>
      <div className="relative h-4 text-[10px] text-metal-500 mt-1">
        {bands.map(([g, lo, hi]) => <span key={g} className="absolute font-semibold" style={{ left: `${(lo + hi) / 2}%`, transform: "translateX(-50%)" }}>{g}</span>)}
        {[50, 70, 85].map((t) => <span key={t} className="absolute tabular-nums" style={{ left: `${t}%`, transform: "translateX(-50%)", top: 12 }}>{t}</span>)}
      </div>
    </div>
  );
}

function Section({ n, title, children, hint }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <span className="grid place-items-center w-6 h-6 rounded-full bg-metal-900 text-white text-[11px] font-black">{n}</span>
        <h3 className="text-sm font-bold text-metal-900">{title}</h3>
      </div>
      {hint && <p className="text-xs text-metal-500 mb-2 ml-8">{hint}</p>}
      <div className="ml-8">{children}</div>
    </section>
  );
}

function SupplierDrawer({ s, onClose }) {
  const radar = s.criteria.filter((c) => c.score !== null).map((c) => ({ criterion: c.label.replace(" (gun)", ""), score: c.score }));
  const e = s.evidence || {};
  const cb = s.costBreakdown;
  const totalPoints = s.criteria.reduce((a, c) => a + (c.points || 0), 0);
  const maxCost = cb ? cb.effectiveRsPerT : 1;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-metal-950/40 backdrop-blur-[2px]" onClick={onClose}>
      <aside className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-gradient-to-r from-metal-950 via-metal-900 to-primary-950 px-6 py-5 text-white">
          <div className="flex items-start gap-4">
            <GradeBadge grade={s.grade} big />
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary-300 font-semibold">{s.materialLabel} · rank {s.rank} of {s.rankOf}</p>
              <h2 className="text-xl font-bold">{s.supplier}</h2>
              <p className="text-sm text-white/60">{s.gradeLabel} · inspect {s.inspectPieces} pieces per lot</p>
            </div>
            <button onClick={onClose} className="p-1 text-white/60 hover:text-white" aria-label="Close"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[["Score", s.score ?? "—"], ["Lots", s.lots], ["Received", `${Number(s.receivedKg).toLocaleString("en-IN")} kg`], ["Effective", rs(s.effectiveRsPerT)]].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2">
                <p className="text-base font-black tabular-nums truncate">{v}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/50">{k}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-7">
          {s.rankReason && (
            <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-900 flex gap-2">
              <Trophy size={16} className="shrink-0 mt-0.5 text-primary-600" />
              <span>{s.rankReason}</span>
            </div>
          )}

          <Section n="1" title="Data used for this ranking" hint="Everything below is calculated from records already in the system — no manual rating.">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                ["Lots received", e.lotsTotal],
                ["Lots decided", e.lotsDecided],
                ["Gun pieces tested", e.piecesTested || 0],
                ["Lab-tested lots", e.labTestedLots || 0],
                ["Heats using them", e.heatsUsed || 0],
                ["Priced lots", s.lotList.filter((l) => l.costPerKg).length],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-metal-200 px-3 py-2">
                  <p className="text-lg font-black tabular-nums text-metal-900">{v}</p>
                  <p className="text-[11px] text-metal-500">{k}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section n="2" title="Score for each criterion" hint="Each criterion is scored 0–100 from the evidence. Criteria without data are skipped and the weights of the rest are scaled up, so missing data never counts against a supplier.">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs min-w-[560px]">
                <thead>
                  <tr className="text-left text-[11px] text-metal-500 border-b border-metal-200">
                    <th className="py-2 pr-2">Criterion</th><th className="pr-2">Evidence → formula</th><th className="text-right pr-2">Score</th><th className="text-right pr-2">Weight</th><th className="text-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {s.criteria.map((c) => (
                    <tr key={c.key} className={clsx("border-b border-metal-100 align-top", c.score === null && "text-metal-400")}>
                      <td className="py-2 pr-2 font-semibold text-metal-800 whitespace-nowrap">{c.label}</td>
                      <td className="pr-2 py-2">
                        <p className={c.score === null ? "text-metal-400" : "text-metal-700"}>{c.evidence}</p>
                        <p className="text-[10.5px] text-metal-400 font-mono mt-0.5">{c.formula}</p>
                      </td>
                      <td className="text-right pr-2 py-2">
                        {c.score === null ? <span className="text-[10.5px]">no data</span> : (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="inline-block w-10 h-1.5 rounded-full bg-metal-100 overflow-hidden"><span className={clsx("block h-full", scoreColor(c.score))} style={{ width: `${c.score}%` }} /></span>
                            <b className="tabular-nums text-metal-900">{c.score}</b>
                          </span>
                        )}
                      </td>
                      <td className="text-right pr-2 py-2 tabular-nums whitespace-nowrap">{c.weight}%{c.score !== null && <span className="block text-[10px] text-metal-400">→ {c.weightShare}%</span>}</td>
                      <td className="text-right py-2 tabular-nums font-bold text-metal-900">{c.points ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="pt-2 text-right text-metal-600 font-semibold pr-2">Total score = sum of points</td>
                    <td className="pt-2 text-right text-base font-black tabular-nums text-primary-700">{Math.round(totalPoints)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-[11px] text-metal-500 mt-2">Points = score × (weight ÷ total weight of criteria with data). Data coverage {s.coverage}% of all weights.</p>
          </Section>

          <Section n="3" title="Score → grade">
            <GradeScale score={s.score} />
            <p className="text-xs text-metal-600 mt-3">
              {s.grade === "NEW"
                ? `Scored ${s.score ?? "—"}, but graded "New" until at least 3 lots are decided (now ${e.lotsDecided}). New suppliers get 25 pieces inspected per lot.`
                : `Score ${s.score} → grade ${s.grade} (${s.gradeLabel}). This sets inspection to ${s.inspectPieces} gun pieces per lot.`}
            </p>
          </Section>

          {cb && (
            <Section n="4" title="True cost of good metal" hint="Invoice price is only the start: lost yield and rejected lots raise what a tonne of usable metal really costs.">
              <div className="space-y-2">
                {[
                  ["Invoice price", cb.invoiceRsPerT, "bg-metal-400", ""],
                  ["+ Yield loss", cb.yieldLossRsPerT, "bg-amber-500", `only ${cb.yieldPct}% becomes metal`],
                  ["+ Rejection cost", cb.rejectCostRsPerT, "bg-red-500", `${cb.rejectSharePct}% not released × ₹${cb.rejectPenaltyRsPerKg}/kg handling`],
                ].map(([k, v, cls, note]) => (
                  <div key={k} className="grid grid-cols-[8.5rem_1fr_6rem] items-center gap-3 text-xs">
                    <span className="text-metal-700 font-medium">{k}{note && <span className="block text-[10px] text-metal-400 font-normal">{note}</span>}</span>
                    <div className="h-2.5 rounded-full bg-metal-100 overflow-hidden"><div className={clsx("h-full rounded-full", cls)} style={{ width: `${Math.max(1, (v / maxCost) * 100)}%` }} /></div>
                    <span className="text-right tabular-nums font-semibold">{rs(v)}</span>
                  </div>
                ))}
                <div className="grid grid-cols-[8.5rem_1fr_6rem] items-center gap-3 text-xs border-t border-metal-200 pt-2">
                  <span className="font-bold text-metal-900">= Effective ₹/t</span>
                  <div className="h-2.5 rounded-full bg-metal-900" />
                  <span className="text-right tabular-nums font-black text-metal-900">{rs(cb.effectiveRsPerT)}</span>
                </div>
              </div>
            </Section>
          )}

          {s.rankVs && (
            <Section n="5" title={`Compared with #${s.rankVs.rank} ${s.rankVs.supplier}`} hint={`Score ${s.score} vs ${s.rankVs.score} — difference in points per criterion.`}>
              <div className="space-y-1.5">
                {s.rankVs.diffs.map((d) => {
                  const w = Math.min(100, Math.abs(d.delta) * 4);
                  return (
                    <div key={d.label} className="grid grid-cols-[10rem_1fr_4rem] items-center gap-3 text-xs">
                      <span className="text-metal-700">{d.label}</span>
                      <div className="relative h-2.5 bg-metal-100 rounded-full">
                        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-metal-300" />
                        <div className={clsx("absolute top-0 bottom-0 rounded-full", d.delta >= 0 ? "bg-emerald-500 left-1/2" : "bg-red-500 right-1/2")} style={{ width: `${w / 2}%` }} />
                      </div>
                      <span className={clsx("text-right tabular-nums font-semibold", d.delta > 0 ? "text-emerald-700" : d.delta < 0 ? "text-red-700" : "text-metal-500")}>{d.delta > 0 ? "+" : ""}{d.delta}</span>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {radar.length >= 3 && (
            <Section n={s.rankVs ? "6" : "5"} title="Criteria profile">
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <RadarChart data={radar} outerRadius="72%">
                    <PolarGrid stroke="#e5eaef" />
                    <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 11, fill: "#4f5f73" }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="score" stroke="#0fa055" fill="#15c26b" fillOpacity={0.35} strokeWidth={2} />
                    <Tooltip formatter={(v) => `${v}/100`} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Section>
          )}

          <Section n={s.rankVs ? "7" : "6"} title="Evidence per lot">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs min-w-[560px]">
                <thead><tr className="text-left text-[11px] text-metal-500 border-b border-metal-200">
                  <th className="py-2">Lot</th><th>Status</th><th className="text-right">Accept</th><th className="text-right">Accuracy</th><th className="text-right">Gun flagged</th><th className="text-right">Yield</th><th className="text-right">₹/kg</th><th className="pl-3">Heats</th>
                </tr></thead>
                <tbody>
                  {(s.perLot || []).map((l) => (
                    <tr key={l.lotId} className="border-b border-metal-100">
                      <td className="py-2 font-mono font-bold">{l.lotId}</td>
                      <td><StatusPill status={l.status} /></td>
                      <td className="text-right tabular-nums">{l.acceptance === null ? "pending" : `${l.acceptance}%`}</td>
                      <td className="text-right tabular-nums">{l.accuracy === null ? "—" : `${l.accuracy}%`}</td>
                      <td className="text-right tabular-nums">{l.gun ? `${l.gun.flagged}/${l.gun.piecesTested}` : "—"}</td>
                      <td className="text-right tabular-nums">{l.yieldPct === null ? "—" : `${l.yieldPct}%`}</td>
                      <td className="text-right tabular-nums">{l.costPerKg ?? "—"}</td>
                      <td className="pl-3 text-[11px] text-metal-600">{l.heats.length ? l.heats.join(", ") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {s.accuracyDetail?.length > 0 && (
            <Section n={s.rankVs ? "8" : "7"} title="Declared vs tested chemistry">
              <table className="w-full text-xs">
                <thead><tr className="text-left text-[11px] text-metal-500 border-b border-metal-200"><th className="py-1.5">Lot</th><th>Element</th><th className="text-right">Declared</th><th className="text-right">Tested</th><th className="text-right">Error</th></tr></thead>
                <tbody>
                  {s.accuracyDetail.map((d, i) => (
                    <tr key={i} className="border-b border-metal-100">
                      <td className="py-1.5 font-mono">{d.lotId}</td>
                      <td className="font-mono font-bold">{d.element}</td>
                      <td className="text-right tabular-nums">{d.declared}</td>
                      <td className="text-right tabular-nums">{d.tested}</td>
                      <td className={clsx("text-right tabular-nums font-semibold", d.errorPct > 20 ? "text-red-700" : d.errorPct > 8 ? "text-amber-600" : "text-emerald-700")}>{d.errorPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}
        </div>
      </aside>
    </div>
  );
}

export default function SupplierScorecard() {
  const [type, setType] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showWeights, setShowWeights] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getSupplierScorecard(type || undefined);
      setData(r.data.data);
    } catch (e) {
      toast.error(errMsg(e, "Could not load the supplier scorecard"));
    } finally {
      setLoading(false);
    }
  }, [type]);
  useEffect(() => { load(); }, [load]);

  const suppliers = data?.suppliers || [];
  const kpis = useMemo(() => {
    const graded = suppliers.filter((s) => s.grade !== "NEW");
    const hidden = suppliers.reduce((sum, s) => sum + (s.effectiveRsPerT && s.invoiceRsPerT ? ((s.effectiveRsPerT - s.invoiceRsPerT) * (s.receivedKg || 0)) / 1000 : 0), 0);
    return {
      count: suppliers.length,
      avg: graded.length ? Math.round(graded.reduce((a, s) => a + (s.score || 0), 0) / graded.length) : null,
      gradeA: suppliers.filter((s) => s.grade === "A").length,
      atRisk: suppliers.filter((s) => s.grade === "C" || s.grade === "D").length,
      hidden: Math.round(hidden),
    };
  }, [suppliers]);

  const grouped = useMemo(() => {
    const g = {};
    suppliers.forEach((s) => { (g[s.materialLabel] = g[s.materialLabel] || []).push(s); });
    return Object.entries(g);
  }, [suppliers]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-metal-950 via-metal-900 to-primary-950 text-white p-6 md:p-8 shadow-metal-xl">
        <div className="pointer-events-none absolute -top-24 -right-16 w-80 h-80 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 shadow-lg ring-1 ring-white/20"><Trophy size={28} /></span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-primary-300 font-semibold">Raw material intelligence</p>
              <h1 className="text-3xl font-black tracking-tight">Supplier Scorecard</h1>
              <p className="text-white/60 text-sm max-w-xl mt-1">Suppliers ranked on the true cost of good metal: quality, declaration accuracy, contamination, yield, delivery and their impact on heats — not the invoice price.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowWeights((v) => !v)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/15 hover:bg-white/10"><SlidersHorizontal size={13} />Weights</button>
            <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/15 hover:bg-white/10"><RefreshCw size={13} />Refresh</button>
          </div>
        </div>
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            [Truck, "Suppliers ranked", kpis.count, "text-white"],
            [ShieldCheck, "Grade A suppliers", kpis.gradeA, "text-emerald-300"],
            [AlertTriangle, "Grade C / D (watch)", kpis.atRisk, "text-amber-300"],
            [TrendingDown, "Hidden cost vs invoice", `₹${kpis.hidden.toLocaleString("en-IN")}`, "text-red-300"],
          ].map(([Icon, l, v, cls]) => (
            <div key={l} className="rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3">
              <Icon size={16} className="text-white/40 mb-1" />
              <p className={clsx("text-2xl font-black tabular-nums", cls)}>{v}</p>
              <p className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {showWeights && data && <WeightsEditor weights={data.weights} onClose={() => setShowWeights(false)} onSaved={() => { setShowWeights(false); load(); }} />}

      <div className="flex flex-wrap gap-2">
        {TYPE_TABS.map(([k, label]) => (
          <button key={k} onClick={() => setType(k)}
            className={clsx("rounded-full px-4 py-1.5 text-sm font-semibold transition-colors", type === k ? "bg-metal-900 text-white shadow" : "bg-white text-metal-600 ring-1 ring-metal-200 hover:ring-primary-300")}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-metal-200 bg-white shadow-metal"><MeltSpinner label="Scoring suppliers…" sublabel="Acceptance, accuracy, contamination, yield, cost and heat impact" /></div>
      ) : suppliers.length === 0 ? (
        <Card><p className="text-center text-metal-500 py-8">No supplier lots yet for this material. Receive a truck on Raw Material Stock to start the ranking.</p></Card>
      ) : (
        grouped.map(([label, list]) => (
          <Card key={label} title={`${label} — ranking`}>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm min-w-[820px]">
                <thead>
                  <tr className="text-left text-xs text-metal-500 border-b border-metal-200">
                    <th className="px-2 py-2 w-12">Rank</th><th className="px-2">Supplier</th><th className="px-2">Grade</th><th className="px-2">Score</th>
                    <th className="px-2 text-right">Lots</th><th className="px-2 text-right">Acceptance</th><th className="px-2 text-right">Invoice ₹/t</th><th className="px-2 text-right">Effective ₹/t</th><th className="px-2 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((s) => {
                    const acc = s.criteria.find((c) => c.key === "acceptance")?.score;
                    return (
                      <tr key={s.supplier} onClick={() => setSelected(s)} className="border-b border-metal-100 cursor-pointer hover:bg-primary-50/50 transition-colors">
                        <td className="px-2 py-3"><span className={clsx("grid place-items-center w-7 h-7 rounded-full text-xs font-black", s.rank === 1 ? "bg-amber-400 text-metal-950" : "bg-metal-100 text-metal-600")}>{s.rank}</span></td>
                        <td className="px-2"><p className="font-semibold text-metal-900">{s.supplier}</p><p className="text-[11px] text-metal-500">{s.gradeLabel}</p></td>
                        <td className="px-2"><GradeBadge grade={s.grade} /></td>
                        <td className="px-2"><ScoreBar score={s.score} /></td>
                        <td className="px-2 text-right tabular-nums">{s.lots}</td>
                        <td className="px-2 text-right tabular-nums">{acc ?? "—"}{acc !== undefined && acc !== null && "%"}</td>
                        <td className="px-2 text-right tabular-nums text-metal-600">{rs(s.invoiceRsPerT)}</td>
                        <td className={clsx("px-2 text-right tabular-nums font-bold", s.effectiveRsPerT > (s.invoiceRsPerT || 0) * 1.1 ? "text-red-700" : "text-metal-900")}>{rs(s.effectiveRsPerT)}</td>
                        <td className="px-2 text-right tabular-nums text-xs">{s.inspectPieces} pcs</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ))
      )}

      <p className="text-xs text-metal-500">
        Score = weighted mix of acceptance {data?.weights?.acceptance}%, declaration accuracy {data?.weights?.accuracy}%, clean pieces {data?.weights?.contamination}%, effective cost {data?.weights?.effectiveCost}%, yield {data?.weights?.yield}%, delivery {data?.weights?.delivery}% and heat impact {data?.weights?.heatImpact}%, compared within each material type. Grades: A ≥ 85, B ≥ 70, C ≥ 50, D below 50; suppliers with fewer than 3 decided lots are "New". Effective cost = invoice ÷ metal yield + rejection cost (return freight, re-inspection, delay).
      </p>

      {selected && <SupplierDrawer s={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
