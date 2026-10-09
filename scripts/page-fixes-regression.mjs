import fs from 'node:fs';import {chromium,expect} from '@playwright/test';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:3003';const b=await chromium.launch(),p=await b.newPage({reducedMotion:'reduce'}),rows=[];const errors=[];p.on('pageerror',e=>errors.push(e.message));
for(const width of [320,390,768,1440]){
 await p.setViewportSize({width,height:900});
 for(const [path,kind,count] of [['/network-service/','lan',6],['/security-system/','security',3]]){
  await p.goto(origin+path);const section=p.locator('#'+kind+'-comparison');await section.scrollIntoViewIfNeeded();await expect(section.locator('tbody tr')).toHaveCount(count);await expect(section.locator('thead th')).toHaveCount(3);await expect(section.locator('tbody th[scope="row"]')).toHaveCount(count);
  expect(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  const region=section.locator('[role="region"]');if(width<640){expect(await region.evaluate(e=>e.scrollWidth>e.clientWidth)).toBe(true);await region.focus();await p.keyboard.press('ArrowRight');await p.waitForTimeout(150);expect(await region.evaluate(e=>e.scrollLeft)).toBeGreaterThan(0);await region.evaluate(e=>e.scrollLeft=0)}
  await p.screenshot({path:`qa/${kind}-comparison-${width}.png`});rows.push({path,width,tableRows:count});
 }
 await p.goto(origin+'/career/');await p.addStyleTag({content:'main *{content-visibility:visible!important}'});
 const darkText=await p.locator('main').evaluate(e=>[...e.querySelectorAll('*')].filter(n=>[...n.childNodes].some(c=>c.nodeType===3&&c.textContent.trim())&&n.getBoundingClientRect().height>0&&/^rgb\(0, 0, 0\)$/.test(getComputedStyle(n).color)).map(n=>n.textContent.trim().slice(0,60)));expect(darkText).toEqual([]);
 await p.getByRole('heading',{name:'พนักงานประจำ',exact:true}).scrollIntoViewIfNeeded();await p.screenshot({path:`qa/career-fix-${width}.png`});
 await p.goto(origin+'/contact/');const button=p.locator('.contact-map-link');await button.scrollIntoViewIfNeeded();const box=await button.boundingBox();expect(Math.abs(box.x+box.width/2-width/2)).toBeLessThanOrEqual(2);expect(box.height).toBeGreaterThanOrEqual(48);await expect(button).toHaveText('ดูแผนที่บน Google Maps');await expect(button).toHaveAttribute('href',/^https:\/\/maps.google.com\/maps\?/);expect(await button.getAttribute('href')).not.toContain('output=embed');await p.screenshot({path:`qa/contact-fix-${width}.png`});
}
for(const width of [390,1440]){await p.setViewportSize({width,height:900});for(const path of ['/network-service/','/security-system/','/career/','/contact/']){await p.goto(origin+path);for(const details of await p.locator('.service-detail').all())await details.evaluate(e=>e.open=true);await p.addStyleTag({content:'main *{content-visibility:visible!important}'});await p.addScriptTag({path:'qa/audit-tools/node_modules/axe-core/axe.min.js'});const result=await p.evaluate(async()=>await window.axe.run('main',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));fs.writeFileSync(`qa/page-fix-axe-${width}-${path.split('/')[1]}.json`,JSON.stringify(result.violations,null,2));expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),path+' '+width).toEqual([])}}
expect(errors).toEqual([]);console.log(JSON.stringify({rows,centeredContactButton:true,careerContrast:true,accessibilityViolations:0,errors},null,2));await b.close();
