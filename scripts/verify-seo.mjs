import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {parseDocument,DomUtils} from 'htmlparser2';
const root=path.resolve('out'),site='https://aitscctv.github.io/website';
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.equal(new Set(urls).size,urls.length,'Sitemap must have no duplicate URLs');
const failures=[];
for(const url of urls){try{
 assert.ok(url.startsWith(site+'/'),'Sitemap URL must use deployment origin and base path');
 const route=url.slice(site.length);
 const document=parseDocument(fs.readFileSync(path.join(root,route,'index.html'),'utf8'));
 const nodes=DomUtils.findAll(n=>n.type==='tag',document.children);
 const meta=name=>nodes.filter(n=>n.name==='meta'&&n.attribs.name===name);
 assert.equal(meta('description').length,1,'Exactly one description');
 assert.ok(meta('description')[0].attribs.content.trim(),'Nonempty description');
 assert.ok(!/noindex|nofollow/.test(meta('robots')[0]?.attribs.content||''),'Indexing enabled');
 assert.equal(nodes.find(n=>n.name==='link'&&n.attribs.rel==='canonical')?.attribs.href,url,'Self-referencing canonical');
 assert.ok(DomUtils.textContent(nodes.find(n=>n.name==='title')).trim(),'Nonempty title');
 for(const image of nodes.filter(n=>n.name==='img'))assert.ok('alt' in image.attribs,`Missing image alt: ${image.attribs.src}`);
 const language=route.startsWith('/en/')?'en':route.startsWith('/zh/')?'zh-Hans':'th';
 assert.equal(nodes.find(n=>n.name==='html')?.attribs.lang,language,'HTML language');
 }catch(error){failures.push({url,error:error.message})}}
const robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8');
assert.ok(!/^Disallow:\s*\/$/m.test(robots));
assert.ok(robots.includes('Sitemap: '+site+'/sitemap.xml'));
console.log(JSON.stringify({pages:urls.length,failures},null,2));
if(failures.length)process.exitCode=1;
