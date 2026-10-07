import {chromium,expect} from '@playwright/test';
import fs from 'node:fs';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:3000';
const routes=JSON.parse(fs.readFileSync('src/generated/routes.json','utf8'));
const browser=await chromium.launch();const issues=[],checks=[],pages=[];
const page=await browser.newPage({viewport:{width:1536,height:900},reducedMotion:'reduce'});
page.on('pageerror',e=>issues.push({type:'runtime',message:e.message}));
await page.route(/youtube(?:-nocookie)?\.com\/embed/,r=>r.fulfill({contentType:'text/html',body:'<html><body>Video embed test</body></html>'}));
async function ready(path='/'){const r=await page.goto(origin+path,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);return r.status()}
for(const width of [1536,1024,768,390]){
 await page.setViewportSize({width,height:900});
 for(const route of routes){
  const status=await ready(route.path);
  const result=await page.evaluate(()=>({overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),hidden:[...document.querySelectorAll('main [data-layout-node]')].filter(e=>{const c=getComputedStyle(e);return !e.classList.contains('design-overlay')&&(c.opacity==='0'||c.visibility==='hidden')&&e.textContent.trim().length>15}).map(e=>e.dataset.layoutNode),emptyLinks:document.querySelectorAll('a[href=""],a[href="#"]').length,brokenAnchors:[...document.querySelectorAll('main a[href^="#"]')].map(e=>e.getAttribute('href').slice(1)).filter(id=>!document.getElementById(id))}));
  pages.push({path:route.path,width,status,...result});
  if(status!==200||result.overflow>1||result.hidden.length||result.emptyLinks||result.brokenAnchors.length)issues.push(pages.at(-1));
 }
}
await page.setViewportSize({width:390,height:844});await ready();
await expect.poll(()=>page.getByRole('heading',{name:'บริการของเรา AITSCCTV',exact:true}).evaluate(e=>e.getBoundingClientRect().width)).toBeGreaterThan(300);
checks.push('phone service headings use the available content width');
await page.getByRole('button',{name:'เปิดเมนู',exact:true}).click();await expect(page.locator('#navigation')).toBeVisible();
await page.locator('#navigation .nav-group').first().locator('summary').click();
await page.locator('#navigation').getByRole('link',{name:'บริการกล้องวงจรปิด',exact:true}).click();
await expect(page).toHaveURL(origin+'/cctv-camera-service/');await expect(page.locator('#navigation')).toBeHidden();checks.push('mobile navigation opens, navigates and closes');
await ready();await page.getByRole('button',{name:'เปิดเมนู',exact:true}).click();await page.locator('#navigation>a').first().focus();await page.keyboard.press('Escape');await expect(page.locator('#navigation')).toBeHidden();checks.push('Escape closes mobile menu');
await page.locator('.faq').first().locator('summary').click();await expect(page.locator('.faq').first()).toHaveAttribute('open','');await expect(page.locator('.faq').first().locator('div')).toBeVisible();checks.push('FAQ expands with visible answer');
await page.setViewportSize({width:1536,height:900});await ready();
await expect(page.locator('.client-marquee-group')).toHaveCount(2);await expect(page.locator('.client-marquee-track')).toHaveCSS('animation-name','none');checks.push('client logo loop respects reduced motion');
await page.getByRole('button',{name:'เล่นวิดีโอ'}).first().click();await expect(page.locator('.video-frame iframe').first()).toBeVisible();checks.push('video control inserts a visible iframe; external playback not tested');
await ready('/internet-system/');const toc=page.locator('main a[href^="#"]').first();const hash=await toc.getAttribute('href');await toc.click();await expect(page).toHaveURL(origin+'/internet-system/'+hash);await expect(page.locator(hash)).toBeInViewport();checks.push('table of contents scrolls to a real heading');
await ready();await page.evaluate(()=>document.querySelector('.client-marquee').scrollIntoView({block:'start',behavior:'instant'}));await expect(page.locator('.reveal-content').first()).toHaveCSS('opacity','1');
await page.evaluate(async()=>{const visible=[...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight});await Promise.all(visible.map(i=>i.decode().catch(()=>{})))});
await page.screenshot({path:'qa/content-fixed-desktop.png'});
await page.getByRole('heading',{name:'บริการของเรา AITSCCTV',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:'qa/services-fixed-desktop.png'});
await page.setViewportSize({width:390,height:844});await ready();await page.getByRole('heading',{name:'บริการของเรา AITSCCTV',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:'qa/services-fixed-phone.png'});
await ready();await page.evaluate(()=>document.querySelector('.client-marquee').scrollIntoView({block:'start',behavior:'instant'}));await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0}).map(i=>i.decode().catch(()=>{})))});await page.screenshot({path:'qa/content-fixed-phone.png'});
await browser.close();const report={pagesChecked:pages.length,checks,issues,pages,liveComparison:'Uses captured reference; live Brave comparison blocked by Computer Use URL verification'};fs.writeFileSync('qa/regression.json',JSON.stringify(report,null,2));console.log(JSON.stringify({pagesChecked:pages.length,checks,issues},null,2));if(issues.length)process.exitCode=1;
