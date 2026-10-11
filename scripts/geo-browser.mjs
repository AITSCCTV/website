import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium,expect} from '@playwright/test';

const root=path.resolve('out');
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(!url.pathname.startsWith('/website/')){res.writeHead(404).end();return}
 let file=path.resolve(root,decodeURIComponent(url.pathname.slice(9)));
 if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(404).end();return}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)){res.writeHead(404).end();return}
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch(),errors=[],checks=[];
fs.mkdirSync('qa/geo',{recursive:true});
try{
 for(const javaScriptEnabled of [false,true]){
  const context=await browser.newContext({javaScriptEnabled,reducedMotion:'reduce'}),page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.url().startsWith(origin)&&response.status()>=400)errors.push(response.status()+' '+response.url())});
  for(const locale of ['','/en','/zh'])for(const width of [320,390,1440]){
   await page.setViewportSize({width,height:844});await page.goto(origin+'/website'+locale+'/articles/');
   const directory=page.locator('.article-directory');
   await expect(directory).toHaveCount(1);await expect(directory).not.toHaveAttribute('open');
   await directory.locator('summary').click();await expect(directory).toHaveAttribute('open','');
   const count=await directory.locator('a').count();expect(count).toBeGreaterThan(12);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
   if(javaScriptEnabled&&width===390&&locale==='/en')await page.screenshot({path:'qa/geo/english-directory-phone.png'});
   if(locale&&width===390){
    await directory.locator('a').last().click();await expect(page.locator('article.english-editorial h1')).toHaveCount(1);
    const schema=await page.locator('article script[type="application/ld+json"]').textContent();
    expect(JSON.parse(schema)['@type']).toBe('Article');
   }
   checks.push({locale:locale||'th',width,javaScriptEnabled,links:count});
  }
  await context.close();
 }
 expect(errors).toEqual([]);
 fs.writeFileSync('qa/geo/browser-audit.json',JSON.stringify({checks,errors},null,2));
 console.log(`Passed ${checks.length} GEO browser checks: three languages, 320/390/1440px, with/without JavaScript, and article navigation.`);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
