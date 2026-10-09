import fs from 'node:fs';import {chromium,expect} from '@playwright/test';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:3005/website';
fs.mkdirSync('qa/english',{recursive:true});
const articles=JSON.parse(fs.readFileSync('src/generated/english-editorial.json'));
const pages=JSON.parse(fs.readFileSync('design-source/routes.json')).filter(r=>r.path!=='/blog/').map(r=>'/en'+r.path);pages.push('/en/articles/');
const paths=[...pages,...articles.map(a=>a.href)],browser=await chromium.launch(),page=await browser.newPage({reducedMotion:'reduce'}),failures=[],checks=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)errors.push(r.status()+' '+r.url())});
for(const width of [320,768,1440]){await page.setViewportSize({width,height:900});for(const route of paths){try{
 const response=await page.goto(origin+route);expect(response.status()).toBe(200);await page.evaluate(()=>document.fonts.ready);
 await page.locator('main details').evaluateAll(es=>es.forEach(e=>e.open=true));
 await expect(page.locator('html')).toHaveAttribute('lang','en');await expect(page.locator('main h1')).toHaveCount(1);
 expect(await page.locator('main').innerText()).not.toMatch(/[\u0e00-\u0e7f]/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 const article=articles.find(a=>a.href===route);await expect(page.locator('.language-switch a').first()).toHaveAttribute('href',article?.original||'/website'+route.replace(/^\/en/,'')||'/website/');
 expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe('https://aitscctv.com'+route);
 await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href','https://aitscctv.com'+route);
 await expect(page.locator('link[hreflang="th"]')).toHaveAttribute('href',article?.original||'https://aitscctv.com'+route.replace(/^\/en/,''));
 const clipped=await page.locator('main h1,main h2,main h3,main p').evaluateAll(es=>es.filter(e=>{const r=e.getBoundingClientRect();return r.height&&r.width&&!e.closest('.table-scroll,.client-marquee')&&(r.left< -2||r.right>innerWidth+2)}).map(e=>e.textContent.slice(0,80)));expect(clipped).toEqual([]);
 checks.push({route,width});
}catch(e){failures.push({route,width,error:e.message.slice(0,1600)})}}console.log('Width',width,'checks',checks.length,'failures',failures.length);}
await page.goto(origin+'/en/blog/?q=CCTV#main');await expect(page).toHaveURL(/\/website\/en\/articles\/\?q=CCTV#main/);await expect(page.getByRole('searchbox')).toHaveValue('CCTV');
const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(origin+'/en/blog/');await expect(nojs).toHaveURL(/\/website\/en\/articles\/$/);await expect(nojs.locator('.archive-grid article')).toHaveCount(12);
await nojs.goto(origin+articles[0].href);await expect(nojs.locator('main h1')).toHaveText(articles[0].title);
await browser.close();fs.writeFileSync('qa/english/export-checks.json',JSON.stringify({checks,failures,errors},null,2));console.log(JSON.stringify({checks:checks.length,failures:failures.length,errors}));if(failures.length||errors.length)process.exitCode=1;
