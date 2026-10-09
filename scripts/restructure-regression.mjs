import fs from 'node:fs';
import {chromium,expect} from '@playwright/test';
import {parseDocument} from 'htmlparser2';
import {servicePolicy} from './service-policy.mjs';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:3003';
const audit=JSON.parse(fs.readFileSync('src/generated/service-structure.json'));
const routes=JSON.parse(fs.readFileSync('src/generated/routes.json'));
const articles=JSON.parse(fs.readFileSync('src/generated/articles.json'));
const gallery=JSON.parse(fs.readFileSync('src/generated/team-gallery.json'));
const catalog=JSON.parse(fs.readFileSync('src/generated/project-catalog.json'));
const stages=['overview','benefits','options','projects','contact'];
const browser=await chromium.launch(),page=await browser.newPage({reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const walk=(n,fn)=>{fn(n);for(const c of n.children||[])walk(c,fn)};
const text=n=>n.type==='text'?n.data:(n.children||[]).map(text).join(' ');
const originalTeams=new Set();
for(const route of routes){const dom=parseDocument(fs.readFileSync('design-source/pages/'+route.id+'.html','utf8'));walk(dom,n=>{if(!n.attribs?.class?.split(' ').includes('section'))return;let team=false;walk(n,c=>{if(/^h[1-6]$/.test(c.name||'')&&text(c).trim().startsWith('ทีมงานของเรา'))team=true});if(team)walk(n,c=>{if(c.name==='img')originalTeams.add(c.attribs.src)})})}
expect(gallery.map(g=>g.original).sort()).toEqual([...originalTeams].sort());
expect(audit.map(a=>a.path).sort()).toEqual(Object.keys(servicePolicy).sort());
for(const width of [390,1536]){
 await page.setViewportSize({width,height:900});
 for(const row of audit){
  await page.goto(origin+row.path);
  expect(await page.locator('[data-service-stage]').evaluateAll(es=>es.map(e=>e.dataset.serviceStage))).toEqual(stages);
  expect(await page.locator('main h1').count()).toBe(1);
  expect(await page.locator('main a[href^="#"]').evaluateAll(es=>es.filter(e=>!document.getElementById(e.getAttribute('href').slice(1))).map(e=>e.getAttribute('href')))).toEqual([]);
  await expect(page.locator('.service-trust a')).toHaveAttribute('href','/about-us/#our-team');
  expect(row.sectionsRetained+row.removed.length).toBe(row.sectionsBefore);
  for(const key of [...row.intro,...row.benefits,...row.options,...row.details])expect(await page.locator(`main [data-layout-node="${key}"]`).count()).toBe(1);
  for(const {key} of row.removed)expect(await page.locator(`main [data-layout-node="${key}"]`).count()).toBe(0);
  for(const warranty of row.warranties)await expect(page.locator('.service-warranty')).toContainText(warranty);
  const source=parseDocument(fs.readFileSync('design-source/pages/'+routes.find(r=>r.path===row.path).id+'.html','utf8'));
  const sourceWarranty=[];walk(source,n=>{const value=text(n).replace(/\s+/g,' ').trim();if(n.name==='p'&&/รับประกัน/.test(value)&&/\d+\s*ปี/.test(value))sourceWarranty.push(value)});
  for(const value of sourceWarranty)await expect(page.locator('main')).toContainText(value);
  const links=await page.locator('.service-project-card h3 a').evaluateAll(es=>es.map(e=>e.href));
  expect(links).toEqual(row.projects.map(p=>p.href));expect(links.length).toBeLessThanOrEqual(3);
  for(const link of links)expect(catalog.some(p=>p.href===link)).toBe(true);
  if(!links.length)await expect(page.locator('.service-project-request a')).toHaveAttribute('href','#service-contact');
  for(const id of stages){await page.locator(`.service-contents a[href="#service-${id}"]`).click();await expect(page.locator('#service-'+id)).toBeInViewport()}
  await expect(page.locator('.service-contact-actions .service-call')).toHaveAttribute('href','tel:0944606196');
  await expect(page.locator('.service-contact-actions .service-line')).toHaveAttribute('href','https://lin.ee/ZianhmV');
  for(const details of await page.locator('.service-detail').all())await details.locator(':scope > summary').click();
  const clipped=await page.evaluate(()=>[...document.querySelectorAll('main p,main h1,main h2,main h3')].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width&&r.height&&!e.closest('.table-scroll,.client-marquee')&&!e.classList.contains('screen-reader-text')&&(r.left< -2||r.right>innerWidth+2||(s.display!=='inline'&&e.scrollWidth>e.clientWidth+3))}).map(e=>e.textContent.trim().slice(0,70)));
  expect(clipped,`${row.path} expanded at ${width}`).toEqual([]);
  if(row.path==='/internet-system/'){await page.locator('#service-projects').scrollIntoViewIfNeeded();await page.screenshot({path:`qa/restructure-projects-${width}.png`});await page.locator('#service-contact').scrollIntoViewIfNeeded();await page.screenshot({path:`qa/restructure-contact-${width}.png`})}
 }
 await page.goto(origin+'/about-us/');expect(await page.locator('#our-team img').count()).toBe(gallery.length);expect(await page.locator('#our-team > .about-team-grid img').count()).toBe(8);
 await page.locator('.about-team-more > summary').click();await expect(page.locator('.about-team-more')).toHaveAttribute('open','');await page.locator('#our-team').scrollIntoViewIfNeeded();await page.screenshot({path:`qa/restructure-team-${width}.png`});
}
for(const route of [...routes,{path:'/en/'},{path:'/articles/'},{path:'/en/articles/'}]){await page.goto(origin+route.path);if(!['/','/en/'].includes(route.path)){expect(await page.locator('.faq').count()).toBe(0);expect(await page.getByRole('heading',{name:/OUR REVIEWS|รีวิวจากลูกค้า/i}).count()).toBe(0)}}
await page.goto(origin+'/our-standard/');expect(await page.locator('.listing-card').count()).toBe(20);
const blog=parseDocument(fs.readFileSync('design-source/pages/3131.html','utf8')),oldBlog=[];
walk(blog,n=>{if(n.name==='article')walk(n,c=>{if(c.name==='a'&&text(c).trim().length>10)oldBlog.push(c.attribs.href)})});
expect(oldBlog.length).toBeGreaterThan(0);for(const href of oldBlog)expect(articles.some(a=>a.href===href)).toBe(true);
await page.goto(origin+'/articles/');expect(await page.locator('.archive-grid article').count()).toBe(12);await expect(page.getByRole('status')).toHaveText(`${articles.length} บทความ`);
const first=await page.locator('.archive-grid h2').first().innerText();await page.getByRole('button',{name:'ถัดไป',exact:true}).click();expect(await page.locator('.archive-grid h2').first().innerText()).not.toBe(first);
await page.getByRole('searchbox').fill('zzzzzzzz');await expect(page.getByRole('status')).toHaveText('0 บทความ');
const r=await fetch(origin+'/blog/?q=CCTV',{redirect:'manual'});expect(r.status).toBe(308);expect(r.headers.get('location')).toContain('/articles/?q=CCTV');
await page.goto(origin+'/blog/?q=CCTV#main');await expect(page).toHaveURL(/\/articles\/\?q=CCTV#main/);await expect(page.getByRole('searchbox')).toHaveValue('CCTV');expect(errors).toEqual([]);
fs.writeFileSync('qa/restructure-regression.json',JSON.stringify({servicePages:audit.length,viewports:[390,1536],galleryImages:gallery.length,articles:articles.length,legacyBlogEntries:oldBlog.length,errors},null,2));
console.log('Restructure checks passed: 22 services, original content accounting, warranties, projects, gallery, archive, redirects and mobile/desktop disclosures.');await browser.close();
