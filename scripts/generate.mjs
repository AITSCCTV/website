import fs from 'node:fs';
import path from 'node:path';
import {parseDocument} from 'htmlparser2';
import {attributesToProps} from 'html-react-parser';
const base=process.cwd(), source=path.join(base,'design-source');
for(const dir of ['src/generated','src/app','public/assets','public/pages'])fs.mkdirSync(path.join(base,dir),{recursive:true});
const routes=JSON.parse(fs.readFileSync(path.join(source,'routes.json'),'utf8'));
// Optimized design assets are versioned in public/assets.
const voids=new Set(['img','br','hr','input','source','wbr']);
let capturedRules=new Map(),currentRoute='',english=false;
const translations=JSON.parse(fs.readFileSync('src/lib/home-en.json','utf8'));
function plain(node){return node.type==='text'?node.data:(node.children||[]).map(plain).join('')}
function walk(node,fn){fn(node);for(const child of node.children||[])walk(child,fn)}
function prepare(nodes){
 const elements=[];for(const n of nodes)walk(n,n=>{if(n.type==='tag')elements.push(n)});
 const headings=elements.filter(n=>/^h[1-6]$/.test(n.name));
 const addClass=(n,c)=>{n.attribs.class=(n.attribs.class||'')+' '+c};
 if(currentRoute==='/'){
  const byKey=new Map(elements.map(n=>[n.attribs['data-layout-node'],n]));
  for(const [key,cls] of Object.entries({n53:'smart-cards',n105:'service-cards',n1782:'portfolio-copy',n1888:'cctv-reasons',n1975:'review-cards'}))addClass(byKey.get(key),cls);
  for(const [key,cls] of [['n53','smart-card'],['n105','service-card'],['n1888','reason-card'],['n1975','review-card']]){
   for(const child of byKey.get(key).children.filter(n=>n.type==='tag'))addClass(child,cls);
  }
  for(const key of ['n59','n69','n79','n89']){
   const img=byKey.get(key),stem=img.attribs.src.replace(/\.webp$/,'');
   img.attribs.srcset=stem+'-320.webp 320w, '+stem+'-640.webp 640w, '+img.attribs.src+' '+img.attribs.width+'w';
   img.attribs.sizes='(max-width: 767px) 96px, (max-width: 1024px) 45vw, 23vw';
  }
 }
 for(const h of headings){
  for(let p=h.parent;p?.name==='div';p=p.parent){
   const children=p.children.filter(n=>n.type==='tag');
   if(children.length!==1)break;
   addClass(p,'text-widget');
  }
 }
 for(const n of elements){
  const children=n.children.filter(n=>n.type==='tag');
  if(children.length<12||!children.every(c=>c.name==='div')||children.filter(c=>plain(c).trim().length>30).length<children.length*.9)continue;
  if(children.filter(c=>{let image=false;walk(c,x=>{if(x.name==='img')image=true});return image}).length<children.length*.7)continue;
  addClass(n,'post-feed');
  for(let p=n.parent;p?.name==='div'&&!p.attribs.class?.split(' ').includes('section');p=p.parent)addClass(p,'post-feed-wrapper');
  for(const c of children){addClass(c,'post-card');walk(c,x=>{if(x.name==='img'){addClass(x.parent,'post-media');addClass(x.parent.parent,'post-media')}if(x.name==='div'&&plain(x).trim().startsWith('•'))addClass(x,'post-meta')})}
 }
 for(const n of elements){
  if(n.name!=='a')continue;
  const href=n.attribs.href||'';
  if(n.attribs.class?.includes('contact-form-link'))n.attribs.href='https://docs.google.com/forms/d/e/1FAIpQLSdB3VqQ5hoTTrXIbbitcY-3NUoRikdHlloTxfnEPzHm-r15kA/viewform';
  if(n.attribs.class?.includes('embed-placeholder')){
   delete n.attribs.style;
   n.attribs.class='external-content-link';
  }
  if(href==='https://aitscctv.com/cctv-service/'||href==='/cctv-service/')n.attribs.href='/cctv-camera-service/';
  if(href.startsWith('#')){
   const text=plain(n).replace(/^\s*\d+[.)]?\s*/,'').trim();
   const target=headings.find(h=>plain(h).trim()===text)||headings.find(h=>text.length>5&&plain(h).trim().includes(text));
   if(target)target.attribs.id=href.slice(1);else{n.name='span';delete n.attribs.href;n.attribs.class=(n.attribs.class||'')+' inactive-control'}
  }
  if(!href.trim()){n.name='span';delete n.attribs.href;delete n.attribs.target;delete n.attribs.rel}
 }
}
function jsx(node){
 if(node.type==='text')return node.data.trim()?'{'+JSON.stringify(english?(translations[node.data.trim()]||node.data):node.data)+'}':'';
 if(node.type!=='tag')return '';
 if(node.name==='script'||node.name==='style')return '';
 // Keep the complete standards/article collection in the archive, not on home.
 if(currentRoute==='/'&&node.attribs['data-layout-node']==='n219')return '';
 if(currentRoute==='/'&&node.attribs['data-layout-node']==='n1790')return '<div className="portfolio-actions"><SiteLink className="portfolio-video-link" href="https://www.youtube.com/@aitscctv9107" target="_blank" rel="noopener">{'+JSON.stringify(english?'Watch more videos':'ดูวีดีโอเพิ่มเติม')+'}</SiteLink><SiteLink className="portfolio-consult-link" href="tel:0944606196">{'+JSON.stringify(english?'Talk to our team':'ปรึกษาเราคลิก')+'}</SiteLink></div>';
 const classNames=node.attribs.class?.split(' ')||[];
 const rule=capturedRules.get(classNames.find(c=>/^v\d+$/.test(c)))||'';
 if(currentRoute==='/'&&node.attribs['data-layout-node']==='n36')return '<ContactPhone english={'+english+'} />';
 if(currentRoute==='/'&&node.attribs['data-layout-node']==='n1937'){
  const cards=node.children.filter(n=>['n1947','n1950','n1953'].includes(n.attribs?.['data-layout-node']));
  return '<div className="promotion-layout"><div className="promotion-intro">'+node.children.filter(n=>!cards.includes(n)).map(jsx).join('')+'</div><div className="promotion-comparison">'+cards.map(n=>{let img;walk(n,x=>{if(x.name==='img')img=x});return '<a className="promotion-poster" href={'+JSON.stringify(img.attribs.src)+'} target="_blank" rel="noopener" aria-label={'+JSON.stringify(english?'Open full-size promotion image':'เปิดภาพโปรโมชั่นขนาดเต็ม')+'}>'+jsx(n)+'</a>'}).join('')+'</div></div>';
 }
 if(/(?:^|;)opacity:0(?:;|$)/.test(rule)||rule.includes('visibility:hidden')){
  if(plain(node).trim()||node.children.some(n=>n.name==='img'))node.attribs.class=(node.attribs.class||'')+' reveal-content';
  else return '';
 }
 if(rule.includes('display:flex')&&rule.includes('flex-direction:row')&&node.children.some(n=>n.type==='tag'&&['div','section','article'].includes(n.name)))node.attribs.class=(node.attribs.class||'')+' layout-row';
 if(rule.includes('max-width:1140px')||rule.includes('max-width:1200px'))node.attribs.class=(node.attribs.class||'')+' layout-inner';
 // Background layers need their own stacking context, not a content-sized hit target.
 if(rule.includes('position:absolute')&&!plain(node).trim()&&!node.children.some(n=>n.name==='img')){
  node.attribs.class=(node.attribs.class||'')+' design-overlay';
  if(node.parent?.attribs)node.parent.attribs.class=(node.parent.attribs.class||'')+' design-layer';
 }
 if(/^(Previous|Next)$/.test(plain(node).trim()) || /^(Previous|Next)$/.test(plain(node).trim().replace(/[\ue000-\uf8ff]/g,'')))return '';
 if(classNames.includes('slider'))return '<LogoCarousel items={['+node.children.filter(n=>n.type==='tag').map((n,i)=>'<Fragment key={'+i+'}> '+jsx(n)+' </Fragment>').join(',')+']} />';
 if(node.attribs.class?.split(' ').includes('video-frame')){
  const link=node.children.find(n=>n.name==='a');
  if(link?.attribs['data-video'])return '<VideoFrame src={'+JSON.stringify(link.attribs['data-video'])+'} style={'+JSON.stringify(attributesToProps(node.attribs).style||{})+'} />';
 }
 const props=attributesToProps(node.attribs);
 if(english&&typeof props.alt==='string'&&/[\u0e00-\u0e7f]/.test(props.alt))props.alt=translations[props.alt.trim()]||'AITSCCTV';
 for(const key of ['colSpan','rowSpan','tabIndex','start'])if(typeof props[key]==='string')props[key]=Number(props[key]);
 const tag=node.name==='a'?'SiteLink':node.name;
 const attrs=Object.entries(props).filter(([k])=>!k.startsWith('on')).map(([k,v])=>' '+k+'={'+JSON.stringify(v)+'}').join('');
 if(voids.has(node.name))return '<'+tag+attrs+' />';
 return '<'+tag+attrs+'>\n'+node.children.map(jsx).filter(Boolean).join('\n')+'\n</'+tag+'>';
}
const imports=[],registry=[];
for(const route of routes){
 const html=fs.readFileSync(path.join(source,'pages',route.id+'.html'),'utf8');
 const ref=JSON.parse(fs.readFileSync(path.join(source,'reference',route.id+'.json'),'utf8'));
 const nodes=parseDocument(html).children;
 currentRoute=route.path;english=false;
 const rawCss=fs.readFileSync(path.join(source,'pages',route.id+'.css'),'utf8');
 capturedRules=new Map([...rawCss.matchAll(/\.(v\d+)\{([^}]+)\}/g)].map(m=>[m[1],m[2]]));
 prepare(nodes);
 // These computed values came from 10%/5% section padding at the reference width.
 // Keep them fluid instead of freezing desktop-sized gaps onto phones.
 const css=rawCss.replace(/(padding-(?:top|right|bottom|left)):152\.075px/g,'$1:10%').replace(/(padding-(?:top|right|bottom|left)):76\.0375px/g,'$1:5%').replace(/\.v(\d+)/g,'.page-'+route.id+' .v$1');
 fs.writeFileSync(path.join(base,'public/pages',route.id+'.css'),css);
 const rendered=nodes.map(jsx).join('');
 const prelude='// Generated from the design capture. Corrections are applied in the generator.\nimport {Fragment} from "react";\nimport {SiteLink} from "../components/SiteLink";\nimport {VideoFrame} from "../components/VideoFrame";\nimport {LogoCarousel} from "../components/LogoCarousel";\nimport {ContactPhone} from "../components/ContactPhone";\n';
 fs.writeFileSync(path.join(base,'src/generated','Page'+route.id+'.tsx'),prelude+'export default function Page'+route.id+'(){return <div className="page-'+route.id+'">'+rendered+'</div>}\n');
 if(route.path==='/'){
  english=true;const en=nodes.map(jsx).join('');english=false;
  fs.writeFileSync('src/generated/HomeEnglish.tsx',prelude+'export default function HomeEnglish(){return <div lang="en" className="page-'+route.id+' english-home">'+en+'</div>}');
  let feed;for(const n of nodes)walk(n,n=>{if(n.attribs?.['data-layout-node']==='n239')feed=n});
  const articles=feed.children.filter(n=>n.type==='tag').map(n=>{const all=[];walk(n,x=>all.push(x));const link=all.find(x=>x.name==='a'&&plain(x).trim().length>20);const img=all.find(x=>x.name==='img');return link?{title:plain(link).trim(),titleEn:translations[plain(link).trim()]||null,href:link.attribs.href,image:img?.attribs.src||null}:null}).filter(Boolean);
  fs.writeFileSync('src/generated/articles.json',JSON.stringify(articles,null,2));
 }
 imports.push('import Page'+route.id+' from "./Page'+route.id+'";');
 registry.push(JSON.stringify(route.path)+': {id:'+JSON.stringify(route.id)+',title:'+JSON.stringify(ref.title)+',description:'+JSON.stringify(ref.description||'')+',Component:Page'+route.id+'}');
}
fs.writeFileSync(path.join(base,'src/generated/pages.ts'),imports.join('\n')+'\nexport const pages={'+registry.join(',\n')+'};\nexport type PagePath=keyof typeof pages;\n');
fs.writeFileSync(path.join(base,'src/generated/routes.json'),JSON.stringify(routes));
console.log('Generated '+routes.length+' typed React pages and scoped styles.');

