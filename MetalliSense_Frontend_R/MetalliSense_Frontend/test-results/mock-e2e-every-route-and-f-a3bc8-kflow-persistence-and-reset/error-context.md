# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mock-e2e.spec.js >> every route and full browser-only workflow, persistence and reset
- Location: tests\mock-e2e.spec.js:6:1

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 200
Received:   200
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - complementary [ref=e5]:
      - generic [ref=e6]:
        - img "MetalliSense Logo" [ref=e9]
        - generic [ref=e11]:
          - generic [ref=e12]:
            - generic [ref=e13]: General
            - button "Onboard Tour" [ref=e14] [cursor=pointer]
            - link "Technical Documentation" [ref=e19] [cursor=pointer]:
              - /url: https://drive.google.com/uc?export=download&id=1t5t6FkgSQS77V5sxvMuya3mn057dNp2B
            - link "Dashboard" [ref=e24] [cursor=pointer]:
              - /url: "#/dashboard"
            - link "Spectrometer" [ref=e31] [cursor=pointer]:
              - /url: "#/spectrometer"
            - link "Grade Specs" [ref=e37] [cursor=pointer]:
              - /url: "#/grades"
          - generic [ref=e43]:
            - generic [ref=e44]: Pre-Production
            - link "Supplier Scorecard" [ref=e45] [cursor=pointer]:
              - /url: "#/supplier-scorecard"
            - link "Inventory Forecast" [ref=e53] [cursor=pointer]:
              - /url: "#/inventory-forecast"
            - link "Raw Material Stock" [ref=e61] [cursor=pointer]:
              - /url: "#/raw-material-stock"
            - link "Yard Inspection (XRF/LIBS)" [ref=e73] [cursor=pointer]:
              - /url: "#/yard-inspection"
            - link "Pre-Melt Gate" [ref=e80] [cursor=pointer]:
              - /url: "#/premelt-gate"
            - link "Energy per Heat" [ref=e85] [cursor=pointer]:
              - /url: "#/energy"
          - generic [ref=e89]:
            - generic [ref=e90]: AI Analysis
            - link "Composition Deviation Analysis" [ref=e91] [cursor=pointer]:
              - /url: "#/anomaly"
            - link "Melt Correction Planner" [ref=e95] [cursor=pointer]:
              - /url: "#/recommendation"
            - link "Adaptive Strategy Optimizer" [ref=e99] [cursor=pointer]:
              - /url: "#/rl-optimizer"
            - link "Full Analysis" [ref=e106] [cursor=pointer]:
              - /url: "#/full-analysis"
            - link "AI Agent Analysis" [ref=e112] [cursor=pointer]:
              - /url: "#/agent"
          - generic [ref=e117]:
            - generic [ref=e118]: Post-Production
            - link "Mechanical Properties" [ref=e119] [cursor=pointer]:
              - /url: "#/mechanical-properties"
          - generic [ref=e124]:
            - generic [ref=e125]: Sales
            - link "Sales & Dispatch" [ref=e126] [cursor=pointer]:
              - /url: "#/sales"
          - generic [ref=e131]:
            - generic [ref=e132]: Training Data
            - link "Synthetic Data" [ref=e133] [cursor=pointer]:
              - /url: "#/synthetic"
            - link "Training Data" [ref=e138] [cursor=pointer]:
              - /url: "#/training-data"
            - link "Semantic Search" [ref=e144] [cursor=pointer]:
              - /url: "#/semantic-search"
            - link "Cost Analysis" [ref=e149] [cursor=pointer]:
              - /url: "#/cost-analysis"
        - generic [ref=e155]:
          - generic [ref=e156]: All Systems Online
          - generic [ref=e159]: OPC Connected • AI Ready
    - generic [ref=e160]:
      - generic [ref=e162]:
        - heading "Pre-Melt Gate" [level=1] [ref=e165]
        - generic [ref=e166]:
          - generic [ref=e167]:
            - generic [ref=e168]: Disconnected
            - button "Connect" [ref=e174] [cursor=pointer]
          - button "User Chemical Engineer 1" [ref=e181] [cursor=pointer]:
            - generic [ref=e183]:
              - generic [ref=e184]: User
              - generic [ref=e185]: Chemical Engineer 1
      - generic [ref=e188]:
        - strong [ref=e189]: Demo mode
        - link "Charge Optimizer" [ref=e190] [cursor=pointer]:
          - /url: "#/charge-optimizer"
        - button "Outbox (3)" [ref=e191] [cursor=pointer]
        - button "Export audit CSV" [ref=e192] [cursor=pointer]
        - button "Reset demo data" [ref=e193] [cursor=pointer]
      - main [ref=e194]:
        - generic [ref=e195]:
          - generic [ref=e196]:
            - generic [ref=e197]:
              - generic [ref=e203]:
                - paragraph [ref=e204]: Furnace interlock
                - heading "Pre-Melt Gate" [level=1] [ref=e205]
                - paragraph [ref=e206]: The furnace starts only when the charge passes — raw-material problems are caught before melting, not after.
              - button "Reset" [ref=e207] [cursor=pointer]
            - generic [ref=e211]:
              - generic [ref=e212]:
                - paragraph [ref=e213]: "3"
                - paragraph [ref=e214]: Planned heats
              - generic [ref=e215]:
                - paragraph [ref=e216]: "1"
                - paragraph [ref=e217]: Melting / done
              - generic [ref=e218]:
                - paragraph [ref=e219]: "0"
                - paragraph [ref=e220]: Cleared (GO)
              - generic [ref=e221]:
                - paragraph [ref=e222]: "0"
                - paragraph [ref=e223]: On HOLD
            - list [ref=e225]:
              - listitem [ref=e226]:
                - generic [ref=e227]: Raw material
              - listitem [ref=e231]:
                - generic [ref=e232]: Yard inspection
              - listitem [ref=e236]:
                - generic [ref=e237]: DRI lab
              - listitem [ref=e241]:
                - generic [ref=e242]: Pre-Melt Gate
              - listitem [ref=e247]:
                - generic [ref=e248]: Melting
              - listitem [ref=e252]:
                - generic [ref=e253]: AI analysis
          - generic [ref=e266]:
            - generic [ref=e267]:
              - generic [ref=e268]:
                - heading "Heats" [level=3] [ref=e272]
                - generic [ref=e274]:
                  - button "H-1053 SG-IRON · planned" [ref=e275] [cursor=pointer]:
                    - generic [ref=e276]: H-1053
                    - generic [ref=e279]: SG-IRON · planned
                  - button "H-1052 SG-IRON · planned" [ref=e280] [cursor=pointer]:
                    - generic [ref=e281]: H-1052
                    - generic [ref=e284]: SG-IRON · planned
                  - button "H-1051 SG-IRON · planned" [ref=e285] [cursor=pointer]:
                    - generic [ref=e286]: H-1051
                    - generic [ref=e289]: SG-IRON · planned
                  - button "H-1043 SG-IRON · completed" [ref=e290] [cursor=pointer]:
                    - generic [ref=e291]: H-1043
                    - generic [ref=e294]: SG-IRON · completed
              - generic [ref=e295]:
                - heading "Plan a heat" [level=3] [ref=e299]
                - generic [ref=e300]:
                  - generic [ref=e301]:
                    - generic [ref=e302]: Grade
                    - combobox "Grade" [ref=e303]:
                      - option "SG-IRON" [selected]
                      - option "GREY-IRON"
                      - option "LOW-CARBON-STEEL"
                      - option "MEDIUM-CARBON-STEEL"
                      - option "HIGH-CARBON-STEEL"
                  - generic [ref=e304]:
                    - generic [ref=e305]: Target charge (kg)
                    - spinbutton "Target charge (kg)" [ref=e306]: "1000"
                  - button "Plan heat" [ref=e307] [cursor=pointer]
            - generic [ref=e309]:
              - generic [ref=e315]:
                - paragraph [ref=e316]: Furnace start is locked
                - paragraph [ref=e317]: Run the pre-melt check on this charge to unlock it.
              - generic [ref=e318]:
                - generic [ref=e319]:
                  - heading "Charge — H-1053 · SG-IRON · target 1,000 kg" [level=3] [ref=e322]
                  - button "Run pre-melt check" [ref=e325] [cursor=pointer]
                - table [ref=e331]:
                  - rowgroup [ref=e332]:
                    - row [ref=e333]:
                      - columnheader "Lot" [ref=e334]
                      - columnheader "Status" [ref=e335]
                      - columnheader "kg" [ref=e336]
                      - columnheader "Share" [ref=e337]
                      - columnheader "In stock" [ref=e338]
                      - columnheader [ref=e339]
                  - rowgroup [ref=e340]:
                    - row [ref=e341]:
                      - cell "DRI-0917 · Coal-based sponge iron lumps" [ref=e342]:
                        - combobox "Lot" [ref=e343]:
                          - option "Choose lot…"
                          - option "PIG-0901 · SG-grade pig iron (low Mn, low P)"
                          - option "RET-1043 · SG iron returns (runners, risers) from H-1043"
                          - option "SCR-0912 · CRCA bundles (clean low-carbon sheet)"
                          - option "SCR-0913 · HMS 1&2 mixed heavy melting scrap"
                          - option "SCR-0914 · Shredded steel scrap"
                          - option "CIS-0915 · Grey iron machine castings (painted)"
                          - option "DRI-0911 · Coal-based sponge iron lumps"
                          - option "DRI-0917 · Coal-based sponge iron lumps" [selected]
                          - option "ALY-0903 · FeSi-75"
                          - option "ALY-0904 · HC FeMn"
                          - option "ALY-0905 · Recarburiser"
                          - option "SCR-0714 · HMS 1&2 heavy melting scrap"
                          - option "DRI-0707 · Coal-based sponge iron lumps"
                          - option "DRI-0714 · Coal-based sponge iron lumps"
                          - option "PIG-0714 · Foundry-grade pig iron"
                          - option "SCR-0921 · Steel scrap"
                      - cell "Released" [ref=e344]
                      - cell [ref=e346]:
                        - spinbutton "kg" [ref=e347]: "941.8"
                      - cell "94.2%" [ref=e348]
                      - cell "3,500 kg" [ref=e349]
                      - cell [ref=e350]:
                        - button "Remove line" [ref=e351] [cursor=pointer]
                    - row [ref=e355]:
                      - cell "ALY-0903 · FeSi-75" [ref=e356]:
                        - combobox "Lot" [ref=e357]:
                          - option "Choose lot…"
                          - option "PIG-0901 · SG-grade pig iron (low Mn, low P)"
                          - option "RET-1043 · SG iron returns (runners, risers) from H-1043"
                          - option "SCR-0912 · CRCA bundles (clean low-carbon sheet)"
                          - option "SCR-0913 · HMS 1&2 mixed heavy melting scrap"
                          - option "SCR-0914 · Shredded steel scrap"
                          - option "CIS-0915 · Grey iron machine castings (painted)"
                          - option "DRI-0911 · Coal-based sponge iron lumps"
                          - option "DRI-0917 · Coal-based sponge iron lumps"
                          - option "ALY-0903 · FeSi-75" [selected]
                          - option "ALY-0904 · HC FeMn"
                          - option "ALY-0905 · Recarburiser"
                          - option "SCR-0714 · HMS 1&2 heavy melting scrap"
                          - option "DRI-0707 · Coal-based sponge iron lumps"
                          - option "DRI-0714 · Coal-based sponge iron lumps"
                          - option "PIG-0714 · Foundry-grade pig iron"
                          - option "SCR-0921 · Steel scrap"
                      - cell "Released" [ref=e358]
                      - cell [ref=e360]:
                        - spinbutton "kg" [ref=e361]: "23.9"
                      - cell "2.4%" [ref=e362]
                      - cell "117.7 kg" [ref=e363]
                      - cell [ref=e364]:
                        - button "Remove line" [ref=e365] [cursor=pointer]
                    - row [ref=e369]:
                      - cell "ALY-0904 · HC FeMn" [ref=e370]:
                        - combobox "Lot" [ref=e371]:
                          - option "Choose lot…"
                          - option "PIG-0901 · SG-grade pig iron (low Mn, low P)"
                          - option "RET-1043 · SG iron returns (runners, risers) from H-1043"
                          - option "SCR-0912 · CRCA bundles (clean low-carbon sheet)"
                          - option "SCR-0913 · HMS 1&2 mixed heavy melting scrap"
                          - option "SCR-0914 · Shredded steel scrap"
                          - option "CIS-0915 · Grey iron machine castings (painted)"
                          - option "DRI-0911 · Coal-based sponge iron lumps"
                          - option "DRI-0917 · Coal-based sponge iron lumps"
                          - option "ALY-0903 · FeSi-75"
                          - option "ALY-0904 · HC FeMn" [selected]
                          - option "ALY-0905 · Recarburiser"
                          - option "SCR-0714 · HMS 1&2 heavy melting scrap"
                          - option "DRI-0707 · Coal-based sponge iron lumps"
                          - option "DRI-0714 · Coal-based sponge iron lumps"
                          - option "PIG-0714 · Foundry-grade pig iron"
                          - option "SCR-0921 · Steel scrap"
                      - cell "Released" [ref=e372]
                      - cell [ref=e374]:
                        - spinbutton "kg" [ref=e375]: "4.9"
                      - cell "0.5%" [ref=e376]
                      - cell "229.8 kg" [ref=e377]
                      - cell [ref=e378]:
                        - button "Remove line" [ref=e379] [cursor=pointer]
                    - row [ref=e383]:
                      - cell "ALY-0905 · Recarburiser" [ref=e384]:
                        - combobox "Lot" [ref=e385]:
                          - option "Choose lot…"
                          - option "PIG-0901 · SG-grade pig iron (low Mn, low P)"
                          - option "RET-1043 · SG iron returns (runners, risers) from H-1043"
                          - option "SCR-0912 · CRCA bundles (clean low-carbon sheet)"
                          - option "SCR-0913 · HMS 1&2 mixed heavy melting scrap"
                          - option "SCR-0914 · Shredded steel scrap"
                          - option "CIS-0915 · Grey iron machine castings (painted)"
                          - option "DRI-0911 · Coal-based sponge iron lumps"
                          - option "DRI-0917 · Coal-based sponge iron lumps"
                          - option "ALY-0903 · FeSi-75"
                          - option "ALY-0904 · HC FeMn"
                          - option "ALY-0905 · Recarburiser" [selected]
                          - option "SCR-0714 · HMS 1&2 heavy melting scrap"
                          - option "DRI-0707 · Coal-based sponge iron lumps"
                          - option "DRI-0714 · Coal-based sponge iron lumps"
                          - option "PIG-0714 · Foundry-grade pig iron"
                          - option "SCR-0921 · Steel scrap"
                      - cell "Released" [ref=e386]
                      - cell [ref=e388]:
                        - spinbutton "kg" [ref=e389]: "29.4"
                      - cell "2.9%" [ref=e390]
                      - cell "342.7 kg" [ref=e391]
                      - cell [ref=e392]:
                        - button "Remove line" [ref=e393] [cursor=pointer]
                  - rowgroup [ref=e397]:
                    - row [ref=e398]:
                      - cell [ref=e399]:
                        - button "Add lot" [ref=e400] [cursor=pointer]
                      - cell [ref=e402]
                      - cell "1,000 kg" [ref=e403]
                      - cell [ref=e404]
          - generic [ref=e405]:
            - heading "Audit trail" [level=3] [ref=e409]
            - generic [ref=e410]:
              - generic [ref=e411]:
                - generic [ref=e412]: 9:55:41 AM
                - generic [ref=e414]: heat planned · H-1053
                - generic [ref=e415]: "Demo charge planner: SG-IRON, 1000 kg"
              - generic [ref=e416]:
                - generic [ref=e417]: 9:55:39 AM
                - generic [ref=e419]: dri qa approved · DRI-0917
                - generic [ref=e420]: "Demo lab checker: QA-00023 → RELEASED"
              - generic [ref=e421]:
                - generic [ref=e422]: 9:55:39 AM
                - generic [ref=e424]: lot status · DRI-0917
                - generic [ref=e425]: "Demo lab checker: RELEASED: QA approved: metallization 93.41%, P 0.04%, S 0.01%"
              - generic [ref=e426]:
                - generic [ref=e427]: 9:55:39 AM
                - generic [ref=e429]: dri qa entered · DRI-0917
                - generic [ref=e430]: "Demo lab maker: QA-00023 v1: metallization 93.41%, P 0.04%"
              - generic [ref=e431]:
                - generic [ref=e432]: 9:55:39 AM
                - generic [ref=e434]: lot status · DRI-0917
                - generic [ref=e435]: "Demo lab maker: PROVISIONAL: Lab result QA-00023 entered by Demo lab maker — waiting for approval"
              - generic [ref=e436]:
                - generic [ref=e437]: 9:55:37 AM
                - generic [ref=e439]: gun session · SCR-0921
                - generic [ref=e440]: "Demo inspector: GUN-00044 XRF: 25 pieces, Cu-high 24, stainless 0, alloy 0 → QUARANTINED"
              - generic [ref=e441]:
                - generic [ref=e442]: 9:55:37 AM
                - generic [ref=e444]: lot status · SCR-0921
                - generic [ref=e445]: "Demo inspector: QUARANTINED: Copper contamination: 24/24 pieces above 0.5% Cu"
              - generic [ref=e446]:
                - generic [ref=e447]: 9:55:28 AM
                - generic [ref=e449]: lot received · SCR-0921
                - generic [ref=e450]: "stores: 1500 kg Steel scrap from Demo delivery"
              - generic [ref=e451]:
                - generic [ref=e452]: 9:55:05 AM
                - generic [ref=e454]: gun session · SCR-0912
                - generic [ref=e455]: "M. Karthik (yard): GUN-00043 XRF: 15 pieces, Cu-high 0, stainless 0, alloy 0 → RELEASED"
              - generic [ref=e456]:
                - generic [ref=e457]: 9:55:05 AM
                - generic [ref=e459]: lot status · SCR-0912
                - generic [ref=e460]: "M. Karthik (yard): RELEASED: 14 pieces tested, none flagged"
              - generic [ref=e461]:
                - generic [ref=e462]: 9:55:05 AM
                - generic [ref=e464]: lot received · ALY-0905
                - generic [ref=e465]: "stores: 400 kg Calcined petroleum coke recarburiser from Goa Carbon"
              - generic [ref=e466]:
                - generic [ref=e467]: 9:55:05 AM
                - generic [ref=e469]: lot received · ALY-0904
                - generic [ref=e470]: "stores: 300 kg High-carbon ferromanganese from Maithan Alloys"
  - generic [aria-hidden] [ref=e471]: H-1034
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
  12 |  expect(errors).toEqual([]);expect(blocked).toEqual([]);expect(failed).toEqual([]);
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
> 34 |  const ledgerAfter=(await call(page,'/api/v2/premelt/movements')).data;expect(ledgerAfter.length).toBeGreaterThan(ledgerBefore.length);
     |                                                                                                   ^ Error: expect(received).toBeGreaterThan(expected)
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