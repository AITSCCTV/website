import fs from 'node:fs';
import {chromium,expect} from '@playwright/test';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:3005/website';
const base=origin.includes('/website')?'/website':'';
const browser=await chromium.launch(),page=await browser.newPage({reducedMotion:'reduce'}),errors=[],checks=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('response',response=>{if(response.url().startsWith(origin)&&response.status()>=400)errors.push(response.status()+' '+response.url())});
const routes=JSON.parse(fs.readFileSync('src/generated/routes.json')).filter(r=>r.path!=='/blog/').map(r=>r.path);
for(const locale of ['','/en','/zh']){
 for(const route of [...routes,'/articles/']){
  await page.setViewportSize({width:390,height:844});
  expect((await page.goto(origin+locale+route)).status()).toBe(200);
  await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await expect(page.locator('main h1')).toHaveCount(1);
  expect(await page.locator('meta[name="robots"]').getAttribute('content')).not.toContain('noindex');
  if(route!=='/articles/')await expect(page.locator('style[data-page-styles]')).toHaveCount(2);
  expect(await page.locator('link[rel="stylesheet"][href*="/pages/"]').count()).toBe(0);
  const links=await page.locator('a[href^="/"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
  if(base)expect(links.filter(href=>!href.startsWith(base+'/')&&!href.startsWith('//'))).toEqual([]);
  checks.push(locale+route);
 }
 await page.goto(origin+locale+'/');
 await page.locator('.menu-toggle').click();await expect(page.locator('#navigation')).toBeVisible();
 await page.locator('#navigation .nav-group').first().locator('summary').click();
 await page.locator('#navigation .nav-group').first().locator('a').first().click();
 await expect(page).toHaveURL(origin+locale+'/cctv-camera-service/');
 await expect(page.locator('#navigation')).toBeHidden();
 for(const width of [320,1440]){
  await page.setViewportSize({width,height:900});await page.goto(origin+locale+'/');await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 }
}
await page.goto(origin+'/en/');await page.locator('.language-switch a').nth(2).click();await expect(page.locator('html')).toHaveAttribute('lang','zh-Hans');
await page.locator('.language-switch a').first().click();await expect(page.locator('html')).toHaveAttribute('lang','th');
await page.goto(origin+'/en/video/');expect(await page.locator('iframe').count()).toBe(0);await page.locator('.video-card button').first().click();await expect(page.locator('iframe')).toHaveCount(1);
expect(errors).toEqual([]);await browser.close();
fs.mkdirSync('qa/mobile-loading',{recursive:true});fs.writeFileSync('qa/mobile-loading/regression.json',JSON.stringify({checks,errors},null,2));
console.log(JSON.stringify({pages:checks.length,errors}));
