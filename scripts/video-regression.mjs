import fs from 'node:fs';
import {chromium,expect} from '@playwright/test';
const origin=process.env.ORIGIN||'http://127.0.0.1:3003';
const b=await chromium.launch({headless:true});
const p=await b.newPage();
const failures=[];p.on('pageerror',e=>failures.push(e.message));
await p.route('https://www.youtube-nocookie.com/embed/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Player test fixture</title>'}));
const rows=[];
for(const [width,columns] of [[320,1],[390,1],[430,1],[768,2],[1024,3],[1440,3]]){
 await p.setViewportSize({width,height:900});await p.goto(origin+'/video/');
 await expect(p.locator('h1')).toHaveCount(1);await expect(p.locator('.video-card')).toHaveCount(12);await expect(p.locator('main iframe')).toHaveCount(0);
 const grid=await p.locator('.video-library-grid').evaluate(e=>({columns:getComputedStyle(e).gridTemplateColumns.split(' ').length,overflow:document.documentElement.scrollWidth-innerWidth,gap:parseFloat(getComputedStyle(e).rowGap)}));
 expect(grid.columns).toBe(columns);expect(grid.overflow).toBeLessThanOrEqual(1);expect(grid.gap).toBeGreaterThanOrEqual(24);
 await p.getByRole('button',{name:'ดูวิดีโอเพิ่มเติม (8)',exact:true}).click();await expect(p.locator('.video-card')).toHaveCount(20);
 const media=await p.locator('.video-card-media').first().boundingBox();expect(Math.abs(media.width/media.height-16/9)).toBeLessThan(.02);
 await p.locator('.video-card-play').first().focus();await p.keyboard.press('Enter');await expect(p.locator('.video-card-media iframe')).toHaveCount(1);
 await expect(p.locator('iframe')).toHaveAttribute('src',/embed\/-zenFSa8GKM\?/);await expect(p.locator('iframe')).toHaveAttribute('title',/EP.126/);
 await p.locator('.video-card-play').first().click();await expect(p.locator('iframe')).toHaveCount(1);await expect(p.locator('iframe')).toHaveAttribute('src',/embed\/HRtM6ev5Eqk\?/);
 await p.goto(origin+'/video/');await p.locator('.video-card img').first().evaluate(i=>i.decode());expect(await p.locator('.video-card img').first().evaluate(i=>i.naturalWidth)).toBeGreaterThan(0);
 await p.screenshot({path:`qa/video-${width}.png`,fullPage:width===390});rows.push({width,...grid});
}
await p.setViewportSize({width:390,height:844});await p.goto(origin+'/video/');await p.addScriptTag({path:'qa/audit-tools/node_modules/axe-core/axe.min.js'});
const axe=await p.evaluate(async()=>await window.axe.run('main',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));expect(axe.violations).toEqual([]);expect(failures).toEqual([]);
fs.writeFileSync('qa/video-regression.json',JSON.stringify({rows,axeViolations:axe.violations,failures},null,2));console.log(JSON.stringify({rows,axeViolations:axe.violations,failures},null,2));await b.close();
