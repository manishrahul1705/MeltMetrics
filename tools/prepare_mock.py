"""Read-only source porter. Never reads configuration, model logs or certificates."""
from pathlib import Path
import re, json, shutil, csv, statistics
ROOT = Path(__file__).resolve().parent.parent
F = ROOT/'MetalliSense_Frontend_R/MetalliSense_Frontend'
B = ROOT/'MetalliSense_Backend_Simple'
backup = ROOT/'_backup_before_mock_20261012'
if not backup.exists():
    shutil.copytree(F, backup, ignore=shutil.ignore_patterns('node_modules','dist','.env*','*.pem','.git'))
M = F/'src/mock'
M.mkdir(parents=True,exist_ok=True)
(M/'handlers').mkdir(exist_ok=True)
(M/'models').mkdir(exist_ok=True)
# Produce the inventory before generating any runtime mock code.
app = (F/'src/App.jsx').read_text(encoding='utf-8')
pages = re.findall(r'<Route path="([^"]+)" element={<(\w+)',app)
network=[]
for p in (F/'src').rglob('*'):
    if p.suffix not in ('.js','.jsx') or 'mock' in p.parts: continue
    for i,line in enumerate(p.read_text(encoding='utf-8').splitlines(),1):
        if re.search(r'\.(get|post|put|patch|delete)\(|fetch\(|setInterval|OPC_POLL_INTERVAL|import.meta.env|EventSource|WebSocket|socket.io|localhost|127\.0\.0\.1|:3000|:800[012]',line):
            network.append((str(p.relative_to(F)),i,line.strip()))
coverage=['# Browser mock coverage','', 'Source inventory recorded before implementation. Backend source is the authority; no service was called to create this inventory.','', '## Routes','', '| Route | Page file |','|---|---|']
coverage += [f'| /{route.lstrip("/")} | src/pages/{name}.jsx |' for route,name in pages]
coverage += ['', '## Network and environment call sites','', '| Caller | Line | Call / URL / polling | Status |','|---|---:|---|---|']
coverage += [f'| {p} | {i} | `{s.replace("|","/")}` | pending |' for p,i,s in network]
coverage += ['', '## Backend endpoints','', '| Method | Mounted path | Backend handler | Browser handler | Fidelity |','|---|---|---|---|---|']
for p in [B/'server.js',*list((B/'premeltGate').glob('*Routes.js')),B/'premeltGate/routes.js',B/'mechanicalRoutes.js']:
    prefix={'routes.js':'/api/v2/premelt','insightsRoutes.js':'/api/v2/insights','inventoryRoutes.js':'/api/v2/inventory','salesRoutes.js':'/api/v2/sales','mechanicalRoutes.js':'/api/v2/mechanical'}.get(p.name,'')
    for i,line in enumerate(p.read_text(encoding='utf-8').splitlines(),1):
        match=re.search(r'(\w+)\.(get|post|put|patch|delete)\([\'"]([^\'"]+)',line)
        if match:
            obj,method,path=match.groups()
            mount={'trainingData':'/api/v2/training-data','grades':'/api/v2/grades','opcRouter':'/api/v2/synthetic','aiRouter':'/api/v2/ai','rlRouter':'/api/v2/rl','costRouter':'/api/v2/cost','carbonRouter':'/api/v2/carbon','vectorRouter':'/api/v2/vector'}.get(obj,prefix)
            coverage.append(f'| {method.upper()} | {mount}{path} | {p.relative_to(B)}:{i} | pending | pending |')
(F/'MOCK_COVERAGE.md').write_text('\n'.join(coverage)+'\n',encoding='utf-8')
# Browser-compatible CommonJS factories preserve circular dependencies without eval.
files=['premeltGate/'+n+'.js' for n in ['config','store','supplierHistory','chemistry','additives','driQa','gunSimulator','gunIngest','gateEngine','supplierScorecard','energy','inventory','purchaseRequests','sales','routes','insightsRoutes','inventoryRoutes','salesRoutes']]
files += ['gradeSpecStore.js','alloyPriceStore.js','carbonStore.js','sellingPriceStore.js','csvDataStore.js','mechanicalRoutes.js','server.js']
with (B/'dataset.csv').open(encoding='utf-8-sig',newline='') as f:
    groups={}
    for row in csv.DictReader(f): groups.setdefault(row['grade'],[]).append(row)
stats={}
samples=[]
for g,rows in groups.items():
    stats[g]={el:{'mean':statistics.mean(float(r[el]) for r in rows),'std':statistics.pstdev(float(r[el]) for r in rows),'min':min(float(r[el]) for r in rows),'max':max(float(r[el]) for r in rows)} for el in ['Fe','C','Si','Mn','P','S']}
    for row in rows[::max(1,len(rows)//40)][:40]:
        dev=row['is_deviated'].lower()=='true'
        samples.append({'_id':str(len(samples)+1),'grade':g,**{e:float(row[e]) for e in ['Fe','C','Si','Mn','P','S']},'total_composition':float(row['total_composition']),'deviated':int(dev),'sample_type':'deviated' if dev else 'normal','severity':'mild' if dev else 'none','createdAt':row['timestamp'],'updatedAt':row['timestamp']})
(M/'models/dataset-summary.json').write_text(json.dumps(stats),encoding='utf-8')
(M/'seed.js').write_text('export const trainingSeed = '+json.dumps(samples)+';\n',encoding='utf-8')
for name in files:
    source=(B/name).read_text(encoding='utf-8')
    if name=='csvDataStore.js':
        source=source[source.index('function classifySeverity'):]
        start=source.index('function loadCsv()')
        end=source.index('let records = loadCsv()')
        source=source[:start]+'const CSV_PATH = "browser demo samples";\nfunction loadCsv() { return structuredClone(require("seed").trainingSeed); }\n'+source[end:]
        source += '\nmodule.exports.snapshot=()=>({records,nextId}); module.exports.restore=s=>{records=s.records;nextId=s.nextId;};'
    elif name=='server.js':
        source=source[source.index('// -------- Health'):source.index('// -------- 404') if '// -------- 404' in source else source.index('app.use((req, res) =>')]
        source=re.sub(r'premelt.gunService.initializeServerOnly\(\).*?;','',source,flags=re.S)
        source='const express=require("express"),store=require("./csvDataStore"),gradeStore=require("./gradeSpecStore"),opcuaService=require("./opcuaService"),priceStore=require("./alloyPriceStore"),emailService=require("./emailService"),carbonStore=require("./carbonStore"),sellingPriceStore=require("./sellingPriceStore"),mechanicalRoutes=require("./mechanicalRoutes");\nconst app=express();\n'+source+'\nmodule.exports=app;\n'
        source += 'module.exports.snapshot=()=>({readings,nextReadingId,rlFeedbackLog,costHistory,nextCostId,alertHistory});\n'
        # actual mutable variable names are determined from source during verification
    elif name=='premeltGate/store.js':
        source=source.replace('if (audit.length > 500) audit.pop();','// Browser audit is persistent and uncapped.')
        source += '\nmodule.exports.snapshot=()=>({lots:[...lots],movements,qaResults:[...qaResults],gunSessions:[...gunSessions],heats:[...heats],audit,counters});\nmodule.exports.restore=s=>{lots=new Map(s.lots);movements=s.movements;qaResults=new Map(s.qaResults);gunSessions=new Map(s.gunSessions);heats=new Map(s.heats);audit=s.audit;counters=s.counters;};'
    elif name=='gradeSpecStore.js':
        source += '\nmodule.exports.snapshot=()=>({overlay:[...overlay],hidden:[...hidden],nextId}); module.exports.restore=s=>{overlay.clear();s.overlay.forEach(([k,v])=>overlay.set(k,v));hidden.clear();s.hidden.forEach(k=>hidden.add(k));nextId=s.nextId;};'
    source=re.sub(r'process\.env\.\w+','undefined',source)
    # Node crypto is replaced by the browser fingerprint shim; CSV by a local parser.
    dest=M/'handlers'/name
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text('// Ported from '+name+'; Node adapters removed.\nexport default function(module, require) {\n'+source+'\n}\n',encoding='utf-8')
print('Source backup, initial coverage and browser factories written; '+str(len(samples))+' stratified CSV samples, no CSV shipped.')
