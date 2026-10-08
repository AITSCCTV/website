import fs from 'node:fs';
import {parseDocument} from 'htmlparser2';
import {chromium,expect} from '@playwright/test';

const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:3000';
const routes=[...JSON.parse(fs.readFileSync('src/generated/routes.json')),{path:'/en/'},{path:'/articles/'},{path:'/en/articles/'}];
const issues=[],measurements=[];
let images=0;
for(const route of routes){
 const response=await fetch(origin+route.path);
 expect(response.status).toBe(200);
 function visit(node){
  if(node.name==='img'&&/\.(webp|png|jpe?g)(?:\?|$)/i.test(node.attribs.src)){
   images++;
   if(!node.attribs.srcset||!node.attribs.sizes)issues.push({path:route.path,image:node.attribs.src,error:'Missing responsive image candidates or sizes'});
   if(!node.attribs.width||!node.attribs.height)issues.push({path:route.path,image:node.attribs.src,error:'Missing intrinsic dimensions'});
  }
  for(const child of node.children||[])visit(child);
 }
 visit(parseDocument(await response.text()));
}
const browser=await chromium.launch();
for(const path of ['/','/articles/','/cctv-camera-service/']){
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();
 const failed=[];
 page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(origin))failed.push({url:r.url(),status:r.status()})});
 await page.goto(origin+path,{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForTimeout(1200);
 const initial=await page.evaluate(()=>performance.getEntriesByType('resource').map(r=>({url:r.name,type:r.initiatorType,bytes:r.decodedBodySize,transfer:r.transferSize})));
 await page.locator('footer').scrollIntoViewIfNeeded();
 await page.waitForTimeout(1200);
 const resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(r=>({url:r.name,type:r.initiatorType,bytes:r.decodedBodySize,transfer:r.transferSize})));
 const legacy=resources.filter(r=>/assets\/[^/]+\.woff2/.test(r.url));
 expect(legacy).toEqual([]);
 // The archive has no internal content links: any RSC prefetch here would
 // come from the shared navigation/footer that should wait for a click.
 if(path==='/articles/')expect(resources.filter(r=>r.url.includes('_rsc='))).toEqual([]);
 expect(failed).toEqual([]);
 const kb=rows=>Math.round(rows.reduce((sum,r)=>sum+r.bytes,0)/1024);
 measurements.push({path,initialImageKB:kb(initial.filter(r=>r.type==='img'||/\.(webp|png|jpg)/.test(r.url))),initialFontKB:kb(initial.filter(r=>r.url.includes('.woff'))),initialCSSKB:kb(initial.filter(r=>r.url.includes('.css'))),prefetchesAfterFooter:resources.filter(r=>r.url.includes('_rsc=')).length,legacyIconFonts:legacy.length});
 await context.close();
}
await browser.close();
fs.mkdirSync('qa',{recursive:true});
fs.writeFileSync('qa/performance-regression.json',JSON.stringify({pages:routes.length,images,measurements,issues},null,2));
console.log(JSON.stringify({pages:routes.length,images,measurements,issues},null,2));
if(issues.length)process.exitCode=1;
