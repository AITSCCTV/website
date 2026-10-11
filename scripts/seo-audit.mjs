import fs from 'node:fs';
import {chromium} from '@playwright/test';
import lighthouse from '../qa/audit-tools/node_modules/lighthouse/core/index.js';
import {launch} from '../qa/audit-tools/node_modules/chrome-launcher/dist/index.js';
const origin=process.env.AUDIT_ORIGIN||'https://aitscctv.github.io/website';
const phase=process.env.AUDIT_PHASE||'live';
const paths=(process.env.AUDIT_PATHS||'/en/').split(',');
const summaries=[];
fs.mkdirSync(`qa/seo/${phase}`,{recursive:true});
for(const path of paths)for(const device of ['mobile','desktop']){
 const chrome=await launch({chromePath:chromium.executablePath(),chromeFlags:['--headless','--no-sandbox','--disable-gpu']});
 try{
  const result=await lighthouse(origin+path,{port:chrome.port,output:['json','html'],onlyCategories:['seo'],logLevel:'error',...(device==='desktop'?{formFactor:'desktop',screenEmulation:{mobile:false,width:1350,height:940,deviceScaleFactor:1,disabled:false}}:{})});
  const name=path.replace(/\W+/g,'-')+device;
  fs.writeFileSync(`qa/seo/${phase}/${name}.json`,result.report[0]);
  fs.writeFileSync(`qa/seo/${phase}/${name}.html`,result.report[1]);
  const lhr=result.lhr;
  const summary={url:lhr.finalDisplayedUrl,device,version:lhr.lighthouseVersion,score:Math.round(lhr.categories.seo.score*100),failures:lhr.categories.seo.auditRefs.map(({id})=>lhr.audits[id]).filter(a=>a.score!==null&&a.score<1).map(a=>({id:a.id,title:a.title,details:a.details,explanation:a.explanation}))};
  summaries.push(summary);console.log(JSON.stringify(summary));
 }finally{await chrome.kill()}
}
fs.writeFileSync(`qa/seo/${phase}/summary.json`,JSON.stringify(summaries,null,2));
if(summaries.some(s=>s.score<95)&&process.env.REQUIRE_SEO==='true')process.exitCode=1;
