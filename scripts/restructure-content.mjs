import fs from 'node:fs';
import {parseDocument} from 'htmlparser2';
import {servicePolicy} from './service-policy.mjs';

const plain=n=>n.type==='text'?n.data:(n.children||[]).map(plain).join('');
const clean=n=>plain(n).replace(/\s+/g,' ').trim();
function walk(n,fn){fn(n);for(const child of n.children||[])walk(child,fn)}
function topSections(nodes){
 const sections=[];
 for(const root of nodes)walk(root,n=>{
  if(!n.attribs?.class?.split(' ').includes('section'))return;
  for(let p=n.parent;p;p=p.parent)if(p.attribs?.class?.split(' ').includes('section'))return;
  sections.push(n);
 });
 return sections;
}
const headings=n=>{const list=[];walk(n,x=>{if(/^h[1-6]$/.test(x.name))list.push(clean(x))});return list};
const key=n=>n.attribs?.['data-layout-node'];
const slug=href=>decodeURIComponent(new URL(href,'https://aitscctv.com').pathname).replace(/^\/|\/$/g,'');
function adopt(parent,children){parent.children=children;for(const child of children)child.parent=parent;return parent}
function element(html,children){const node=parseDocument(html).children[0];return children?adopt(node,children):node}

export function createEditorialContent(routes,source,images,translations){
 const descriptors=src=>{
  const image=images[src];if(!image)return {image:src};
  const candidate=image.variants.find(v=>v.width>=640)||image.variants.at(-1);
  return {image:candidate.src,srcSet:image.variants.map(v=>v.src+' '+v.width+'w').join(', '),width:image.width,height:image.height};
 };
 const read=id=>parseDocument(fs.readFileSync(source+'/pages/'+id+'.html','utf8')).children;
 let feed;for(const n of read('1751'))walk(n,x=>{if(key(x)==='n239')feed=x});
 const articles=feed.children.filter(n=>n.type==='tag').map(n=>{
  const all=[];walk(n,x=>all.push(x));const link=all.find(x=>x.name==='a'&&clean(x).length>20),img=all.find(x=>x.name==='img');
  return link?{title:clean(link),titleEn:translations[clean(link)]||null,href:link.attribs.href,...descriptors(img?.attribs.src)}:null;
 }).filter(Boolean);
 const portfolio=[];for(const root of read('438'))walk(root,n=>{
  if(n.name!=='article')return;const all=[];walk(n,x=>all.push(x));const link=all.find(x=>x.name==='a'&&clean(x).length>10),img=all.find(x=>x.name==='img');
  if(link)portfolio.push({title:clean(link),href:link.attribs.href,...descriptors(img?.attribs.src)});
 });
 const catalog=new Map([...articles,...portfolio].map(a=>[slug(a.href),a]));
 const team=new Map();
 for(const route of routes)for(const section of topSections(read(route.id))){
  if(!headings(section).some(h=>h.startsWith('ทีมงานของเรา')))continue;
  walk(section,n=>{if(n.name==='img'&&!team.has(n.attribs.src))team.set(n.attribs.src,{original:n.attribs.src,alt:n.attribs.alt||'',...descriptors(n.attribs.src)})});
 }
 fs.writeFileSync('src/generated/team-gallery.json',JSON.stringify([...team.values()],null,2));
 fs.writeFileSync('src/generated/project-catalog.json',JSON.stringify([...catalog.values()],null,2));
 // The archive keeps its complete source collection; portfolio entries remain
 // independently accessible rather than being silently merged into articles.
 fs.writeFileSync('src/generated/portfolio.json',JSON.stringify(portfolio,null,2));
 return {catalog,articles,portfolio,team:[...team.values()]};
}

export function restructureContent(nodes,path,editorial){
 let root;for(const n of nodes)walk(n,x=>{if(key(x)==='n0')root=x});
 if(path==='/about-us/'){
  const target=root.children.findIndex(n=>key(n)==='n261');
  const gallery=element('<aits-about-team></aits-about-team>');gallery.parent=root;
  root.children.splice(target<0?root.children.length:target,0,gallery);
  return null;
 }
 const policy=servicePolicy[path];if(!policy)return null;
 const sections=topSections(nodes),byKey=new Map(sections.map(n=>[key(n),n]));
 if(sections.some(n=>n.parent!==root))throw Error('Unexpected section nesting: '+path);
 const intro=sections.slice(0,2),removed=[],remaining=[],nestedRemoved=[];
 const warranties=[];
 // Captured TOCs can also sit inside an introduction, not just in a separate
 // section. Remove that widget while retaining the surrounding service copy.
 for(const section of sections){
  if(!headings(section).length)continue;
  let title;walk(section,n=>{if(n.type==='text'&&n.data.includes('เลือกอ่านหัวข้อที่สนใจ'))title=n});
  let container=title?.parent;
  while(container?.parent!==section&&container?.parent&&headings(container.parent).every(h=>h==='เลือกอ่านหัวข้อที่สนใจ'))container=container.parent;
  if(container?.parent){nestedRemoved.push(key(container));container.parent.children.splice(container.parent.children.indexOf(container),1)}
 }
 for(const section of sections.slice(2)){
  const hs=headings(section),text=clean(section);
  const generic=[/หลักการออกแบบที่ดี/,/มาที่เดียวก็ครบ/,/มีความเป็นมืออาชีพ/,/ใส่ใจดูแลลูกค้า/,/มีการรับประกันสินค้า/,/สะดวก.{0,40}สวยงาม/,/วางแผนอย่างมีระบบ/,/บริการอย่างมืออาชีพ/].filter(pattern=>pattern.test(text)).length>=3;
  let reason;
  if(hs.some(h=>h.startsWith('ทีมงานของเรา')))reason='team moved to About Us';
  else if(hs.some(h=>/^รวม(?:ผลงาน|รีวิว|ลูกค้า)/.test(h)))reason='replaced with relevant published content';
  else if(text.startsWith('เลือกอ่านหัวข้อที่สนใจ')&&!hs.length)reason='replaced with consistent section navigation';
  else if(generic){
   reason='generic sales claims condensed into service benefits and trust statement';
   // Preserve the original warranty copy, including qualifiers, rather than
   // replacing service-specific periods with a site-wide promise.
   walk(section,n=>{if(n.name==='p'&&/รับประกัน|Onsite|เงื่อนไข|^\*/i.test(clean(n)))warranties.push(clean(n))});
  }
  else if(hs.some(h=>/^ให้คำปรึกษาฟรี$/.test(h))||/^(?:ให้คำปรึกษาฟรี|["“]?\s*Let AITS Set Standard|["“]?AITSCCTV ดูแลทุกขั้นตอน|["“]?ทุกบริการเราดูแลโดยผู้เชี่ยวชาญ|สนใจติดต่อได้ที่|นอกจากนี้เรายังรับให้คำแนะนำ|ทีมงานพร้อมให้คำแนะนำ|เมื่อต้องการติดกล้อง|หากต้องการสอบถามข้อมูลเพิ่มเติม|ไม่ว่าคุณกำลังต้องการติดตั้ง)/.test(text))reason='replaced with one quotation/contact section';
  if(reason)removed.push({key:key(section),reason});else remaining.push(section);
 }
 const take=keys=>keys.map(k=>{const node=byKey.get(k);if(!node||!remaining.includes(node))throw Error('Missing retained section '+path+' '+k+' '+JSON.stringify(removed));return node});
 const benefits=take(policy.benefits),options=take(policy.options);
 if(benefits.some(n=>options.includes(n)))throw Error('Section assigned twice: '+path);
 const details=remaining.filter(n=>!benefits.includes(n)&&!options.includes(n));
 const projects=policy.projects.map(selection=>{
  const item=editorial.catalog.get(selection.slug);
  if(!item)throw Error('Published project missing: '+path+' '+selection.slug);
  return {...item,kind:selection.kind};
 });
 const data={label:policy.label,points:policy.points,context:policy.context,projects,warranties:[...new Set(warranties)],hasPublishedPrices:options.some(n=>/ราคา|แพ็กเกจ/.test(headings(n).join(' ')))};
 const disclosure=(label,content)=>content.length?element('<details class="service-detail"><summary>'+label+'</summary><div></div></details>',[element('<summary>'+label+'</summary>'),element('<div class="service-detail-content"></div>',content)]):null;
 const stage=(id,title,children)=>element('<section id="service-'+id+'" class="service-stage" data-service-stage="'+id+'"></section>',[
  ...(title?[element('<div class="service-stage-heading"><h2>'+title+'</h2></div>')]:[]),...children.filter(Boolean),
 ]);
 const overview=stage('overview','',[...intro,element('<aits-service-trust></aits-service-trust>')]);
 const benefitStage=stage('benefits','ประโยชน์และการใช้งาน',[element('<aits-service-benefits></aits-service-benefits>'),disclosure('รายละเอียดประโยชน์และการใช้งาน',benefits)]);
 const optionStage=stage('options','รูปแบบบริการและราคา',[element('<aits-service-pricing></aits-service-pricing>'),...options,element('<aits-service-warranty></aits-service-warranty>'),disclosure('รายละเอียดทางเทคนิคและแนวทางเลือกใช้งาน',details)]);
 const projectStage=stage('projects','ผลงานและเนื้อหาที่เกี่ยวข้อง',[element('<aits-service-projects></aits-service-projects>')]);
 const contactStage=stage('contact','ขอใบเสนอราคาและติดต่อทีมงาน',[element('<aits-service-contact></aits-service-contact>')]);
 adopt(root,[overview,element('<aits-service-contents></aits-service-contents>'),benefitStage,optionStage,projectStage,contactStage]);
 return {data,audit:{path,intro:intro.map(key),benefits:benefits.map(key),options:options.map(key),details:details.map(key),removed,nestedRemoved,sectionsBefore:sections.length,sectionsRetained:intro.length+benefits.length+options.length+details.length,projects:projects.map(p=>({href:p.href,title:p.title,kind:p.kind})),warranties:data.warranties}};
}
