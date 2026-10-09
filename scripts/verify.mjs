import fs from 'node:fs';
import {parseDocument} from 'htmlparser2';
const routes=JSON.parse(fs.readFileSync('src/generated/routes.json','utf8'));
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:3000';
const issues=[],assetPaths=new Set(),results=[];
function visit(node,fn){fn(node);for(const child of node.children||[])visit(child,fn)}
for(const route of routes){
 const response=await fetch(origin+route.path),html=await response.text();
 let h1=0,lang='',canonical='',hasMain=false,description=false;
 visit(parseDocument(html),node=>{
  if(node.name==='h1')h1++;
  if(node.name==='html')lang=node.attribs.lang;
  if(node.name==='main')hasMain=true;
  if(node.name==='meta'&&node.attribs.name==='description')description=Boolean(node.attribs.content);
  if(node.name==='link'&&node.attribs.rel==='canonical')canonical=node.attribs.href;
  for(const key of ['src','href']){const value=node.attribs?.[key];if(value?.startsWith('/assets/')||value?.startsWith('/pages/')||value?.startsWith('/_next/'))assetPaths.add(value)}
 });
 const target=route.path==='/blog/'?'/articles/':route.path;
 if(response.status!==200||h1!==1||lang!=='th'||!hasMain||canonical!=='https://aitscctv.com'+target||(route.path==='/blog/'&&!response.redirected))issues.push({path:route.path,status:response.status,h1,lang,hasMain,canonical});
 results.push({path:route.path,status:response.status,h1,lang,description});
}
for(const asset of assetPaths){const r=await fetch(origin+asset);if(!r.ok)issues.push({asset,status:r.status});if(asset.endsWith('.css')){const css=await r.text();for(const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)){const url=new URL(match[1],origin+asset);if(url.origin===origin)assetPaths.add(url.pathname)}}}
const missing=await fetch(origin+'/this-page-does-not-exist/');if(missing.status!==404)issues.push({missingPageStatus:missing.status});
const robots=await (await fetch(origin+'/robots.txt')).text();if(!robots.includes('Disallow: /'))issues.push({robots:'preview must be noindex'});
const report={pages:results.length,assetPaths:assetPaths.size,issues,results,visualBrowserVerification:false,wordpressApi:'403 Forbidden',productionChanged:false};
fs.mkdirSync('qa',{recursive:true});fs.writeFileSync('qa/http-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({pages:results.length,assetPaths:assetPaths.size,issues},null,2));if(issues.length)process.exitCode=1;
