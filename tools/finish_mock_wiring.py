from pathlib import Path
f=Path('MetalliSense_Frontend_R/MetalliSense_Frontend')
p=f/'src/mock/server.js';s=p.read_text(encoding='utf-8-sig');s=s.replace("'!./handlers/instruments.js'","'!./handlers/instruments.js', '!./handlers/optimizer.js'")
pos=s.index(" if(path==='/__mock/state')")
s=s[:pos]+''' if(path==='/__mock/optimize'){
  try { const {solveCharge}=await import('./handlers/optimizer.js');const st=requirePort('premeltGate/store');return {status:200,data:{status:'success',data:solveCharge(body,st.listLots().map(l=>({...l,availableKg:st.availableKg(l.lotId)})),requirePort('premeltGate/config'),requirePort('premeltGate/chemistry'))}}; } catch(e) {return {status:422,data:{message:e.message}};}
 }
 if(path==='/__mock/accept-strategy'){
  const st=requirePort('premeltGate/store'),h=st.heats.get(body.heatId),b=body;
  if(!h||h.status!=='MELTING')return {status:409,data:{message:'A melting heat is required'}};
  if(h.acceptedStrategy){if(h.acceptedStrategy.strategy!==b.candidate.strategy)return {status:409,data:{message:'A strategy was already applied to this heat'}};return {status:200,data:{status:'success',data:h.acceptedStrategy}};}
  const additions=b.candidate.recommended_additions||{},mass=h.gate.prediction.metalKg;
  const lines=requirePort('premeltGate/additives').suggest(additions,mass);
  if(additions.Fe>0){const lot=st.listLots().find(l=>l.materialType==='PIG_IRON'&&l.status==='RELEASED'&&st.availableKg(l.lotId)>0);const kg=mass*additions.Fe/100/((requirePort('premeltGate/chemistry').lotChemistry(lot).composition.Fe||94)/100);lines.push({lotId:lot?.lotId,kg,inStock:!!lot&&kg<=st.availableKg(lot.lotId),element:'Fe'});}
  if(lines.some(l=>!l.lotId||!l.inStock||!Number.isFinite(l.kg)||l.kg<=0||l.kg>st.availableKg(l.lotId)))return {status:409,data:{message:'Accepted strategy cannot be applied: insufficient released additive stock'}};
  const before=structuredClone(st.snapshot()),oldExtra=structuredClone(extra);
  try {
   for(const l of lines)st.addMovement({lotId:l.lotId,kg:-l.kg,type:'ADDITION',heatId:h.heatId,by:'operator',note:'Accepted '+b.candidate.strategy});
   h.acceptedStrategy={...b.candidate,deductedLines:lines};h.correctionReading=b.composition;h.currentComposition={...b.composition};h.postCorrectionTicks=0;
   ai.feedback({grade:h.grade,composition:b.composition,additions,aggressiveness:b.candidate.aggressiveness,outcome:'accepted',heatId:h.heatId});
   st.log('STRATEGY_ACCEPTED',h.heatId,'operator',b.candidate.strategy+'; accepted candidate quantities deducted');await persist();return {status:200,data:{status:'success',data:h.acceptedStrategy}};
  } catch(e){st.restore(before);extra=oldExtra;return {status:409,data:{message:e.message}};}
 }
''' + s[pos:];p.write_text(s,encoding='utf-8')
p=f/'src/App.jsx';s=p.read_text(encoding='utf-8');s=s.replace('import React from "react";','import React, { lazy, Suspense } from "react";');import re
s=re.sub(r'import (\w+) from "(\./pages/[^\"]+)";',r'const \1 = lazy(() => import("\2"));',s)
s=s.replace('const Router =',"const ChargeOptimizer = import.meta.env.VITE_MOCK_MODE === 'true' ? lazy(() => import('./mock/ChargeOptimizer.jsx')) : null;\nconst Router =")
s=s.replace('<Routes>','<Suspense fallback={<div className="p-6">Loading…</div>}><Routes>');s=s.replace('</Routes>','</Routes></Suspense>');s=s.replace('<Route path="sales" element={<SalesInvoices />} />','<Route path="sales" element={<SalesInvoices />} />\n                  {ChargeOptimizer && <Route path="charge-optimizer" element={<ChargeOptimizer />} />}');p.write_text(s,encoding='utf-8')
p=f/'src/components/layout/MainLayout.jsx';s=p.read_text(encoding='utf-8');s=s.replace('const pageTitles =',"const DemoControls = import.meta.env.VITE_MOCK_MODE === 'true' ? React.lazy(() => import('../../mock/DemoControls.jsx')) : null;\n\nconst pageTitles =");s=s.replace('<TopBar title={title} />','<TopBar title={title} />\n        {DemoControls && <React.Suspense fallback={null}><DemoControls /></React.Suspense>}');p.write_text(s,encoding='utf-8')
# Each acceptance UI uses one atomic mock transaction; real-service paths remain intact.
for name in ['RLOptimizer','FullAnalysis']:
 p=f/'src/pages'/ (name+'.jsx');s=p.read_text(encoding='utf-8');needle='      await rlSubmitFeedback({'
 start=s.index(needle,s.index('const handleFeedback ='));s=s[:start]+'''      if (import.meta.env.VITE_MOCK_MODE === 'true' && outcome === 'accepted' && isUnlocked && flow.heatId) {
        const r = await fetch('/__mock/accept-strategy', {method:'POST',body:JSON.stringify({heatId:flow.heatId,candidate,composition:reading.composition})});
        const j = await r.json();
        if (!r.ok) throw new Error(j.message);
        acceptStrategy(j.data);
        toast.success('Strategy accepted — selected quantities deducted. Policy updated.');
''' + ('        setChosenStrategy(candidate.strategy);\n' if name=='FullAnalysis' else '        await loadPolicyStatus();\n')+'''        return;
      }
''' + s[start:];p.write_text(s,encoding='utf-8')
# Use browser TTS directly, with the existing read-aloud button.
p=f/'src/components/common/ReadAloud.jsx';s=p.read_text(encoding='utf-8');s=s.replace('    cleanup();\n    setState("loading");','''    cleanup();
    if (import.meta.env.VITE_MOCK_MODE === 'true') {
      try { speakWithBrowser(t); } catch { setState('idle'); toast.error('Speech synthesis is unavailable in this browser'); }
      return;
    }
    setState("loading");''');p.write_text(s,encoding='utf-8')
p=f/'src/components/common/AIChatInterface.jsx';s=p.read_text(encoding='utf-8');s=s.replace('const [messages, setMessages] = useState([]);',"const [messages, setMessages] = useState(() => import.meta.env.VITE_MOCK_MODE === 'true' ? JSON.parse(localStorage.getItem('metallisense.demo.chat') || '[]') : []);\n  useEffect(() => { if (import.meta.env.VITE_MOCK_MODE === 'true') localStorage.setItem('metallisense.demo.chat', JSON.stringify(messages)); }, [messages]);")
s=s.replace('  const startRecording = async () => {','''  const startRecording = async () => {
    if (import.meta.env.VITE_MOCK_MODE === 'true') {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) { toast.error('Speech recognition is unavailable in this browser. Type your question instead.'); return; }
      const recognition = new Recognition(); recognition.lang = 'en-IN'; recognition.interimResults = false;
      recognition.onresult = e => { setInputMessage(e.results[0][0].transcript); setIsRecording(false); };
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = e => { setIsRecording(false); toast.error('Speech recognition: ' + e.error); };
      mediaRecorderRef.current = recognition; recognition.start(); setIsRecording(true); return;
    }
''');p.write_text(s,encoding='utf-8')
