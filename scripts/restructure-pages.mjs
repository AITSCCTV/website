import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium,expect} from '@playwright/test';
const root=path.resolve('out');
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');if(!url.pathname.startsWith('/website/')){res.writeHead(404).end();return}let file=path.resolve(root,decodeURIComponent(url.pathname.slice(9)));if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(404).end();return}if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)){res.writeHead(404).end();return}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch();const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)errors.push(r.status()+' '+r.url())});
await p.goto(origin+'/website/blog/?q=CCTV#main');await expect(p).toHaveURL(/\/website\/articles\/\?q=CCTV#main/);await expect(p.getByRole('searchbox')).toHaveValue('CCTV');
for(const [route,id,count] of [['network-service','lan',6],['security-system','security',3]]){await p.goto(origin+'/website/'+route+'/');await expect(p.locator('#'+id+'-comparison tbody tr')).toHaveCount(count);expect(await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1)}
await p.goto(origin+'/website/contact/');const map=await p.locator('.contact-map-link').boundingBox();expect(Math.abs(map.x+map.width/2-195)).toBeLessThanOrEqual(2);
await p.goto(origin+'/website/video/');await expect(p.locator('.video-card')).toHaveCount(12);await expect(p.locator('main iframe')).toHaveCount(0);await expect(p.locator('.video-card img').first()).toHaveAttribute('src',/^\/website\/assets\//);await p.getByRole('button',{name:'ดูวิดีโอเพิ่มเติม (8)',exact:true}).click();await expect(p.locator('.video-card')).toHaveCount(20);expect(await p.locator('.video-library-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length)).toBe(1);
await p.goto(origin+'/website/internet-system/');await p.locator('.service-contents a[href="#service-contact"]').click();await expect(p.locator('#service-contact')).toBeInViewport();await expect(p.locator('.service-trust a')).toHaveAttribute('href','/website/about-us/#our-team');
await p.locator('.service-trust a').click();await expect(p.locator('#our-team')).toBeInViewport();expect(await p.locator('#our-team img').count()).toBe(69);
await p.goto(origin+'/website/');expect(await p.locator('.faq').count()).toBeGreaterThan(0);expect(await p.locator('main img[srcset]').count()).toBeGreaterThan(0);
const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(origin+'/website/blog/');await expect(nojs).toHaveURL(/\/website\/articles\/$/);await expect(nojs.locator('.archive-grid article')).toHaveCount(12);
expect(errors).toEqual([]);await browser.close();await new Promise(resolve=>server.close(resolve));console.log('GitHub Pages browser checks passed: base path, legacy redirect/search/hash, no-JavaScript fallback, service links, gallery and responsive assets.');
