from pathlib import Path
import re,json
root=Path.cwd(); f=root/'MetalliSense_Frontend_R/MetalliSense_Frontend'; m=f/'src/mock'
# Correct and add persistence for all ported module state.
p=m/'handlers/server.js'; s=p.read_text(encoding='utf-8'); s=s.replace('alertHistory','alertLog'); s=s.replace('module.exports.snapshot=()=>({readings,nextReadingId,rlFeedbackLog,costHistory,nextCostId,alertLog});','''module.exports.snapshot=()=>({readings,nextReadingId,rlFeedbackLog,costHistory,nextCostId,alertLog,nextAlertId,carbonHistory,nextCarbonId});
module.exports.restore=s=>{for(const k of ['readings','rlFeedbackLog','costHistory','alertLog','carbonHistory']) { const a={readings,rlFeedbackLog,costHistory,alertLog,carbonHistory}[k];a.splice(0,a.length,...(s[k]||[])); }nextReadingId=s.nextReadingId;nextCostId=s.nextCostId;nextAlertId=s.nextAlertId;nextCarbonId=s.nextCarbonId;};''');p.write_text(s,encoding='utf-8')
for name,variables in {'premeltGate/sales':['invoices','invCounter','settings'],'premeltGate/purchaseRequests':['requests','counter'],'premeltGate/energy':['settings'],'premeltGate/inventory':['settings'],'premeltGate/supplierScorecard':['settings'],'premeltGate/config':['settings'],'alloyPriceStore':['elementPrices','baseMetalPrices'],'carbonStore':['elementFactors','baseMetalFactors'],'sellingPriceStore':['sellingPrices']}.items():
 p=m/'handlers'/ (name+'.js');s=p.read_text(encoding='utf-8'); vs=[v for v in variables if re.search(r'(?:let|const) '+v+r'\b',s)]; decl={v:bool(re.search(r'let '+v+r'\b',s)) for v in vs}
 code='\nmodule.exports.snapshot=()=>({'+','.join(vs)+'}); module.exports.restore=s=>{'+''.join(v+'=s.'+v+';' if decl[v] else 'Object.assign('+v+',s.'+v+');' for v in vs)+'};\n'
 pos=s.rfind('\n}');s=s[:pos]+code+s[pos:];p.write_text(s,encoding='utf-8')
# Reuse the page's implemented formula, including exact response keys.
s=(f/'src/pages/MechanicalProperties.jsx').read_text(encoding='utf-8');stand=s[s.index('const STANDARDS ='):s.index('//',s.index('};',s.index('const STANDARDS =')))]
fun=s[s.index('function predictFromChemistry'):s.index('//',s.index('\n}\n',s.index('function predictFromChemistry')))];(m/'handlers/mechanical.js').write_text(stand+'\n'+fun+'\nexport { STANDARDS, predictFromChemistry };',encoding='utf-8')
# Strict compile-time initialization, so mock modules are absent from normal bundles.
p=f/'src/main.jsx';s=p.read_text(encoding='utf-8');s=s.replace("createRoot(document", "if (import.meta.env.VITE_MOCK_MODE === 'true') {\n  await (await import('./mock/server.js')).startMock();\n}\n\ncreateRoot(document");p.write_text(s,encoding='utf-8')
p=f/'src/App.jsx';s=p.read_text(encoding='utf-8').replace('BrowserRouter as Router,','BrowserRouter,\n  HashRouter,');s=s.replace('function App() {',"const Router = import.meta.env.VITE_MOCK_MODE === 'true' ? HashRouter : BrowserRouter;\n\nfunction App() {");p.write_text(s,encoding='utf-8')
p=f/'package.json';j=json.loads(p.read_text());j['scripts'].update({'dev:mock':'vite --mode mock','build:mock':'vite build --mode mock','test:mock':'vitest run','test:mock:e2e':'playwright test'});p.write_text(json.dumps(j,indent=2)+'\n')
# The requested NEW mode file is created; existing env files are never read or changed.
p=f/'.env.mock'
if not p.exists():p.write_text('VITE_MOCK_MODE=true\n')
p=f/'vite.config.js';s=p.read_text();s=s.replace("export default defineConfig({","export default defineConfig(({ mode }) => ({\n  base: process.env.VITE_BASE_PATH || './',\n  envPrefix: mode === 'mock' ? ['VITE_MOCK_MODE', 'VITE_BASE_PATH'] : 'VITE_',");s=s.replace('})','}))');p.write_text(s)
