# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mock-e2e.spec.js >> every route and full browser-only workflow, persistence and reset
- Location: tests\mock-e2e.spec.js:6:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "Failed to load resource: net::ERR_FAILED",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - heading "MetalliSense" [level=1] [ref=e7]
      - paragraph [ref=e8]: Create your account
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]:
          - generic [ref=e12]: Full Name
          - textbox "Full Name" [ref=e15]:
            - /placeholder: John Doe
        - generic [ref=e16]:
          - generic [ref=e17]: Email Address
          - textbox "Email Address" [ref=e20]:
            - /placeholder: you@example.com
        - generic [ref=e21]:
          - generic [ref=e22]: Role
          - combobox "Role" [ref=e25]:
            - option "Chemical Engineer 1" [selected]
            - option "Chemical Engineer 2"
            - option "Chemical Engineer 3"
            - option "Supervisor"
            - option "Manager"
            - option "Unit Controller"
        - generic [ref=e26]:
          - generic [ref=e27]: Password
          - textbox "Password" [ref=e30]:
            - /placeholder: ••••••••
        - generic [ref=e31]:
          - generic [ref=e32]: Confirm Password
          - textbox "Confirm Password" [ref=e35]:
            - /placeholder: ••••••••
        - button "Create Account" [ref=e36] [cursor=pointer]
      - paragraph [ref=e42]:
        - text: Already have an account?
        - link "Sign in" [ref=e43] [cursor=pointer]:
          - /url: "#/login"
  - generic [aria-hidden] [ref=e44]: H-1034
```

# Test source

```ts
  1  | ﻿import { test,expect } from '@playwright/test';
  2  | const routes=['dashboard','anomaly','recommendation','rl-optimizer','agent','grades','synthetic','spectrometer','training-data','semantic-search','cost-analysis','full-analysis','mechanical-properties','raw-material-stock','yard-inspection','premelt-gate','supplier-scorecard','energy','inventory-forecast','sales','charge-optimizer','login','signup'];
  3  | async function call(page,path,body,method=body?'POST':'GET'){
  4  |  return page.evaluate(async({path,body,method})=>{const r=await fetch(path,{method,body:body?JSON.stringify(body):undefined});const j=await r.json();if(!r.ok)throw new Error(path+': '+JSON.stringify(j));return j;},{path,body,method});
  5  | }
  6  | test('every route and full browser-only workflow, persistence and reset',async({page})=>{
  7  |  const errors=[],blocked=[],failed=[];
  8  |  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>failed.push(r.url()));
  9  |  await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin==='http://127.0.0.1:4179'||['data:','blob:'].includes(u.protocol))return route.continue();blocked.push(u.href);return route.abort();});
  10 |  await page.goto('/#/dashboard');await page.waitForFunction(()=>!!window.__METALLISENSE_MOCK__);await expect(page.getByText('Demo mode',{exact:true})).toBeVisible();
  11 |  for(const route of routes){await page.goto('/#/'+route);await page.waitForTimeout(850);await expect(page.locator('body')).not.toContainText(/service unavailable|Unexpected Application Error|Could not reach/i);}
> 12 |  expect(errors).toEqual([]);expect(blocked).toEqual([]);expect(failed).toEqual([]);
     |                 ^ Error: expect(received).toEqual(expected) // deep equality
  13 |  await page.goto('/#/raw-material-stock');
  14 |  const lot=(await call(page,'/api/v2/premelt/lots',{materialType:'STEEL_SCRAP',supplier:'Demo delivery',receivedKg:1500,costPerKg:30,truckNo:'TN DEMO 01',demoScenario:'copper',declared:{C:.1,Si:.2,Mn:.5,P:.02,S:.01,Cu:.8},by:'Demo operator'})).data;
  15 |  await call(page,'/api/v2/premelt/gun/inspect',{lotId:lot.lotId,device:'XRF',pieces:25,surfacePrepared:true,inspector:'Demo inspector'});
  16 |  await expect.poll(async()=>{const r=await call(page,'/api/v2/premelt/gun/live');return r.data?.status;},{timeout:30000}).toBe('Session Complete');
  17 |  const inspected=(await call(page,'/api/v2/premelt/lots/'+lot.lotId)).data;expect(inspected.lot.status).toBe('QUARANTINED');
  18 |  const qa=(await call(page,'/api/v2/premelt/lots/DRI-0917/dri-qa',{analyst:'Demo lab maker',feTotal:91,feMetallic:85,C:.15,P:.04,S:.01,SiO2:4,Al2O3:2,CaO:.9,MgO:.4,moisture:.2,fines:2,confirmWarnings:true})).data;
  19 |  const released=(await call(page,'/api/v2/premelt/dri-qa/'+qa.qaId+'/approve',{approver:'Demo lab checker'})).data;expect(released.lot.status).toBe('RELEASED');
  20 |  await page.goto('/#/charge-optimizer');await page.getByRole('button',{name:'Optimize charge',exact:true}).click();await expect(page.getByRole('button',{name:'Use this mix'}).first()).toBeVisible({timeout:20000});
  21 |  const before=(await call(page,'/api/v2/premelt/movements')).data.length;
  22 |  await page.getByRole('button',{name:'Use this mix'}).first().click();await expect(page).toHaveURL(/premelt-gate/);expect((await call(page,'/api/v2/premelt/movements')).data.length).toBe(before);
  23 |  const heats=(await call(page,'/api/v2/premelt/heats')).data,heat=heats.find(h=>Number(h.heatId.slice(2))>1052&&!h.history);expect(heat).toBeTruthy();
  24 |  const gate=(await call(page,'/api/v2/premelt/heats/'+heat.heatId+'/gate-check',{by:'Demo operator'})).data;expect(['GO','WARN','HOLD']).toContain(gate.decision);expect(gate.checks.length).toBeGreaterThan(5);
  25 |  await call(page,'/api/v2/premelt/heats/'+heat.heatId+'/start-melting',{operator:'Demo operator',acknowledgeWarnings:true,...(gate.decision==='HOLD'?{override:{engineer:'Demo engineer',reason:'Reviewed simulated charge and approved a demo-only run'}}:{})});
  26 |  await expect.poll(async()=>{const r=await call(page,'/api/v2/api/v1/spectrometer');return r.data.filter(r=>r.heatId===heat.heatId).length;},{timeout:15000}).toBeGreaterThan(0);
  27 |  const c={Fe:98,C:.02,Si:.02,Mn:.02,P:.06,S:.05};
  28 |  const an=(await call(page,'/api/v2/ai/anomaly/predict',{grade:'LOW-CARBON-STEEL',composition:c}));expect(an.is_anomaly||an.anomaly_score>.5).toBeTruthy();
  29 |  const correction=(await call(page,'/api/v2/ai/individual/analyze',{metalGrade:'LOW-CARBON-STEEL',composition:c})).data;expect(correction.aiAnalysis.alloyRecommendation).toBeTruthy();
  30 |  const composition={...gate.prediction.composition,C:2.9,Si:1.7,Mn:.2};
  31 |  const ranked=(await call(page,'/api/v2/rl/optimize',{grade:heat.grade,composition,batchWeightKg:gate.prediction.metalKg})).data;expect(ranked.candidates.length).toBe(3);
  32 |  const candidate=ranked.candidates.find(c=>c.strategy==='balanced'),ledgerBefore=(await call(page,'/api/v2/premelt/movements')).data;
  33 |  const accepted=(await call(page,'/__mock/accept-strategy',{heatId:heat.heatId,candidate,composition})).data;expect(accepted.deductedLines.length).toBeGreaterThan(0);
  34 |  const ledgerAfter=(await call(page,'/api/v2/premelt/movements')).data;expect(ledgerAfter.length).toBeGreaterThan(ledgerBefore.length);
  35 |  await call(page,'/__mock/accept-strategy',{heatId:heat.heatId,candidate,composition});expect((await call(page,'/api/v2/premelt/movements')).data.length).toBe(ledgerAfter.length);
  36 |  const mechanical=(await call(page,'/api/v2/mechanical/predict',{grade:heat.grade,composition:gate.prediction.composition})).data;expect(mechanical.predicted_uts_mpa).toBeGreaterThan(0);
  37 |  const completed=(await call(page,'/api/v2/sales/heats/'+heat.heatId+'/complete',{approvedBy:'Demo tap engineer',composition:gate.prediction.composition,mechanical,acceptedStrategy:accepted})).data;expect(completed.status).toBe('COMPLETED');
  38 |  const invoice=(await call(page,'/api/v2/sales/invoices',{heatId:heat.heatId,customerId:'C-001',createdBy:'Demo sales',poNumber:'SO-1001'})).data;expect(invoice.total).toBeGreaterThan(0);
  39 |  for(const path of ['/api/v2/inventory/forecast','/api/v2/insights/suppliers/scorecard','/api/v2/insights/energy/summary'])expect((await call(page,path)).data).toBeTruthy();
  40 |  const audit=(await call(page,'/api/v2/premelt/audit?limit=9999')).data;expect(audit.some(a=>a.ref===heat.heatId&&a.type==='HEAT_COMPLETED')).toBe(true);
  41 |  const answer=await call(page,'/copilot/chat',{message:'Why is '+heat.heatId+' on HOLD?'});expect(answer.response).toContain(heat.heatId);
  42 |  await page.reload();await page.waitForFunction(()=>!!window.__METALLISENSE_MOCK__);expect((await call(page,'/api/v2/sales/invoices')).data.some(i=>i.invoiceId===invoice.invoiceId)).toBe(true);
  43 |  await page.getByRole('button',{name:/Outbox/}).click();await expect(page.getByRole('dialog',{name:'Demo Outbox'})).toContainText(/quarantined|Anomaly/);await page.getByRole('button',{name:'Close',exact:true}).click();
  44 |  page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Reset demo data'}).click();await page.waitForFunction(()=>!!window.__METALLISENSE_MOCK__);await expect.poll(async()=>((await call(page,'/api/v2/sales/invoices')).data.length)).toBe(0);
  45 |  expect((await call(page,'/api/v2/premelt/lots')).data.some(l=>l.lotId===lot.lotId)).toBe(false);
  46 |  expect(errors).toEqual([]);expect(blocked).toEqual([]);expect(failed).toEqual([]);
  47 | });
  48 | 
```