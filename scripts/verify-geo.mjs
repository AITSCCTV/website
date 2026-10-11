import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {parseDocument,DomUtils} from 'htmlparser2';

const root=path.resolve('out'),site='https://aitscctv.github.io/website';
const urls=[...fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const counts={pages:urls.length,articles:0,services:0,directories:0};
const failures=[];
for(const url of urls){try{
 const route=url.slice(site.length),html=fs.readFileSync(path.join(root,route,'index.html'),'utf8');
 const document=parseDocument(html);
 const scripts=DomUtils.findAll(n=>n.name==='script'&&n.attribs?.type==='application/ld+json',document.children);
 const entities=scripts.flatMap(n=>{const data=JSON.parse(DomUtils.textContent(n));assert.equal(data['@context'],'https://schema.org');return data['@graph']||[data]});
 const business=entities.find(n=>n['@type']==='LocalBusiness'),website=entities.find(n=>n['@type']==='WebSite');
 assert.equal(business?.['@id'],'https://aitscctv.com/#organization');
 assert.equal(business.telephone,'+66-2-878-2951');
 assert.equal(website?.url,site+'/');
 const page=entities.find(n=>['Article','WebPage','CollectionPage'].includes(n['@type']));
 assert.equal(page?.url,url,'Structured data must match page canonical');
 const language=route.startsWith('/en/')?'en':route.startsWith('/zh/')?'zh-Hans':'th';
 assert.equal(page.inLanguage,language);
 for(const image of [business.logo,page.image].filter(Boolean)){
  assert.ok(image.startsWith(site+'/assets/'),'Structured image uses deployment assets');
  assert.ok(fs.existsSync(path.join(root,image.slice(site.length))),'Structured image exists');
 }
 if(page['@type']==='Article'){
  counts.articles++;assert.ok(Number.isFinite(Date.parse(page.datePublished)),'Valid source publication date');
  const time=DomUtils.findOne(n=>n.name==='time',document.children,true);
  assert.equal(page.datePublished,time.attribs.datetime+'+07:00','Schema date matches visible source date');
  assert.equal(page.publisher['@id'],business['@id']);
  assert.ok(page.translationOfWork.url.startsWith('https://aitscctv.com/'));
 }
 if(page.mainEntity?.['@type']==='Service'){counts.services++;assert.equal(page.mainEntity.provider['@id'],business['@id'])}
 if(page['@type']==='CollectionPage'){
  counts.directories++;
  const directory=DomUtils.findOne(n=>n.name==='details'&&n.attribs?.class==='article-directory',document.children,true);
  assert.ok(directory,'Native expandable directory');
  const links=DomUtils.findAll(n=>n.name==='a',directory.children);
  const source=JSON.parse(fs.readFileSync(language==='th'?'src/generated/articles.json':language==='en'?'src/generated/english-editorial-index.json':'src/generated/chinese-editorial-index.json','utf8'));
  assert.equal(links.length,source.length,'Every article has a server-rendered directory link');
  const hrefs=new Set(links.map(n=>n.attribs.href));
  for(const article of source)assert.ok(hrefs.has(article.href.startsWith('/')?'/website'+article.href:article.href),`Missing directory article ${article.href}`);
 }
 assert.ok(!entities.some(n=>n.aggregateRating||n.review),'No invented rating markup');
}catch(error){failures.push({url,error:error.message})}}
const report={...counts,failures};
fs.mkdirSync('qa/geo',{recursive:true});fs.writeFileSync('qa/geo/technical-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));if(failures.length)process.exitCode=1;
