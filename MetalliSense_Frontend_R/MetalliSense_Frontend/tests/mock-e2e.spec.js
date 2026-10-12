import { test,expect } from '@playwright/test';
const routes=['dashboard','anomaly','recommendation','rl-optimizer','agent','grades','synthetic','spectrometer','training-data','semantic-search','cost-analysis','full-analysis','mechanical-properties','raw-material-stock','yard-inspection','premelt-gate','supplier-scorecard','energy','inventory-forecast','sales','charge-optimizer','login','signup'];
async function call(page,path,body,method=body?'POST':'GET'){
 return page.evaluate(async({path,body,method})=>{const r=await fetch(path,{method,body:body?JSON.stringify(body):undefined});const j=await r.json();if(!r.ok)throw new Error(path+': '+JSON.stringify(j));return j;},{path,body,method});
}
test('every route and full browser-only workflow, persistence and reset',async({page})=>{
 const errors=[],blocked=[],failed=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>failed.push(r.url()));
 await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin==='http://127.0.0.1:4179'||['data:','blob:'].includes(u.protocol))return route.continue();blocked.push(u.href);return route.abort();});
 await page.goto('/#/dashboard');await page.waitForFunction(()=>!!window.__METALLISENSE_MOCK__);await expect(page.getByText('Demo mode',{exact:true})).toBeVisible();
 for(const route of routes){await page.goto('/#/'+route);await page.waitForTimeout(850);await expect(page.locator('body')).not.toContainText(/service unavailable|Unexpected Application Error|Could not reach/i);}
 expect(errors).toEqual([]);expect(blocked).toEqual([]);expect(failed).toEqual([]);
 await page.goto('/#/raw-material-stock');
 const lot=(await call(page,'/api/v2/premelt/lots',{materialType:'STEEL_SCRAP',supplier:'Demo delivery',receivedKg:1500,costPerKg:30,truckNo:'TN DEMO 01',demoScenario:'copper',declared:{C:.1,Si:.2,Mn:.5,P:.02,S:.01,Cu:.8},by:'Demo operator'})).data;
 await call(page,'/api/v2/premelt/gun/inspect',{lotId:lot.lotId,device:'XRF',pieces:25,surfacePrepared:true,inspector:'Demo inspector'});
 await expect.poll(async()=>{const r=await call(page,'/api/v2/premelt/gun/live');return r.data?.status;},{timeout:30000}).toBe('Session Complete');
 const inspected=(await call(page,'/api/v2/premelt/lots/'+lot.lotId)).data;expect(inspected.lot.status).toBe('QUARANTINED');
 const qa=(await call(page,'/api/v2/premelt/lots/DRI-0917/dri-qa',{analyst:'Demo lab maker',feTotal:91,feMetallic:85,C:.15,P:.04,S:.01,SiO2:4,Al2O3:2,CaO:.9,MgO:.4,moisture:.2,fines:2,confirmWarnings:true})).data;
 const released=(await call(page,'/api/v2/premelt/dri-qa/'+qa.qaId+'/approve',{approver:'Demo lab checker'})).data;expect(released.lot.status).toBe('RELEASED');
 await page.goto('/#/charge-optimizer');await page.getByRole('button',{name:'Optimize charge',exact:true}).click();await expect(page.getByRole('button',{name:'Use this mix'}).first()).toBeVisible({timeout:20000});
 const before=(await call(page,'/api/v2/premelt/movements')).data.length;
 await page.getByRole('button',{name:'Use this mix'}).first().click();await expect(page).toHaveURL(/premelt-gate/);expect((await call(page,'/api/v2/premelt/movements')).data.length).toBe(before);
 const heats=(await call(page,'/api/v2/premelt/heats')).data,heat=heats.find(h=>Number(h.heatId.slice(2))>1052&&!h.history);expect(heat).toBeTruthy();
 const gate=(await call(page,'/api/v2/premelt/heats/'+heat.heatId+'/gate-check',{by:'Demo operator'})).data;expect(['GO','WARN','HOLD']).toContain(gate.decision);expect(gate.checks.length).toBeGreaterThan(5);
 await call(page,'/api/v2/premelt/heats/'+heat.heatId+'/start-melting',{operator:'Demo operator',acknowledgeWarnings:true,...(gate.decision==='HOLD'?{override:{engineer:'Demo engineer',reason:'Reviewed simulated charge and approved a demo-only run'}}:{})});
 await expect.poll(async()=>{const r=await call(page,'/api/v2/api/v1/spectrometer');return r.data.filter(r=>r.heatId===heat.heatId).length;},{timeout:15000}).toBeGreaterThan(0);
 const c={Fe:98,C:.02,Si:.02,Mn:.02,P:.06,S:.05};
 const an=(await call(page,'/api/v2/ai/anomaly/predict',{grade:'LOW-CARBON-STEEL',composition:c}));expect(an.is_anomaly||an.anomaly_score>.5).toBeTruthy();
 const correction=(await call(page,'/api/v2/ai/individual/analyze',{metalGrade:'LOW-CARBON-STEEL',composition:c})).data;expect(correction.aiAnalysis.alloyRecommendation).toBeTruthy();
 const composition={...gate.prediction.composition,C:2.9,Si:1.7,Mn:.2};
 const ranked=(await call(page,'/api/v2/rl/optimize',{grade:heat.grade,composition,batchWeightKg:gate.prediction.metalKg})).data;expect(ranked.candidates.length).toBe(3);
 const candidate=ranked.candidates.find(c=>c.strategy==='balanced'),ledgerBefore=(await call(page,'/api/v2/premelt/movements')).data;
 const accepted=(await call(page,'/__mock/accept-strategy',{heatId:heat.heatId,candidate,composition})).data;expect(accepted.deductedLines.length).toBeGreaterThan(0);
 const ledgerAfter=(await call(page,'/api/v2/premelt/movements')).data;expect(ledgerAfter.length).toBeGreaterThan(ledgerBefore.length);
 await call(page,'/__mock/accept-strategy',{heatId:heat.heatId,candidate,composition});expect((await call(page,'/api/v2/premelt/movements')).data.length).toBe(ledgerAfter.length);
 const mechanical=(await call(page,'/api/v2/mechanical/predict',{grade:heat.grade,composition:gate.prediction.composition})).data;expect(mechanical.predicted_uts_mpa).toBeGreaterThan(0);
 const completed=(await call(page,'/api/v2/sales/heats/'+heat.heatId+'/complete',{approvedBy:'Demo tap engineer',composition:gate.prediction.composition,mechanical,acceptedStrategy:accepted})).data;expect(completed.status).toBe('COMPLETED');
 const invoice=(await call(page,'/api/v2/sales/invoices',{heatId:heat.heatId,customerId:'C-001',createdBy:'Demo sales',poNumber:'SO-1001'})).data;expect(invoice.total).toBeGreaterThan(0);
 for(const path of ['/api/v2/inventory/forecast','/api/v2/insights/suppliers/scorecard','/api/v2/insights/energy/summary'])expect((await call(page,path)).data).toBeTruthy();
 const audit=(await call(page,'/api/v2/premelt/audit?limit=9999')).data;expect(audit.some(a=>a.ref===heat.heatId&&a.type==='HEAT_COMPLETED')).toBe(true);
 const answer=await call(page,'/copilot/chat',{message:'Why is '+heat.heatId+' on HOLD?'});expect(answer.response).toContain(heat.heatId);
 await page.reload();await page.waitForFunction(()=>!!window.__METALLISENSE_MOCK__);expect((await call(page,'/api/v2/sales/invoices')).data.some(i=>i.invoiceId===invoice.invoiceId)).toBe(true);
 await page.getByRole('button',{name:/Outbox/}).click();await expect(page.getByRole('dialog',{name:'Demo Outbox'})).toContainText(/quarantined|Anomaly/);await page.getByRole('button',{name:'Close',exact:true}).click();
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Reset demo data'}).click();await page.waitForFunction(()=>!!window.__METALLISENSE_MOCK__);await expect.poll(async()=>((await call(page,'/api/v2/sales/invoices')).data.length)).toBe(0);
 expect((await call(page,'/api/v2/premelt/lots')).data.some(l=>l.lotId===lot.lotId)).toBe(false);
 expect(errors).toEqual([]);expect(blocked).toEqual([]);expect(failed).toEqual([]);
});
