from pathlib import Path
import urllib.request,re
root=Path.cwd();dest=root/'src/assets/demo-fonts';dest.mkdir(parents=True,exist_ok=True)
url='https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap'
request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36'})
css=urllib.request.urlopen(request,timeout=30).read().decode();blocks=re.findall(r'(@font-face\s*\{.*?\})',css,re.S)
if not blocks:raise RuntimeError('No Latin font subsets returned')
output=[]
for i,block in enumerate(blocks):
 u=re.search(r'url\((https:[^)]+)\)',block).group(1);name=f'font-{i}.'+u.rsplit('.',1)[-1];(dest/name).write_bytes(urllib.request.urlopen(u,timeout=30).read());output.append(block.replace(u,'./assets/demo-fonts/'+name))
(root/'src/mock/fonts.css').write_text('\n'.join(output));print('Downloaded',len(output),'local font subsets')
