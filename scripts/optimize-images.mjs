import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {parseDocument} from 'htmlparser2';

const sources=new Set();
function walk(n){if(n.name==='img'&&n.attribs.src)sources.add(n.attribs.src);for(const c of n.children||[])walk(c)}
for(const file of fs.readdirSync('design-source/pages')){
 const content=fs.readFileSync('design-source/pages/'+file,'utf8');
 if(file.endsWith('.html'))walk(parseDocument(content));
 if(file.endsWith('.css'))for(const m of content.matchAll(/url\(["']?([^"')]+)["']?\)/g))if(/\.(?:jpe?g|png|webp)(?:\?|$)/i.test(m[1]))sources.add(m[1]);
}
// The design capture includes the complete archive; include the shared header.
sources.add('/assets/d32bdcfe9b2edc06.webp');
const previous=fs.existsSync('src/lib/image-assets.json')?JSON.parse(fs.readFileSync('src/lib/image-assets.json')):{};
const manifest={},failures=[];
async function optimize(src){
 try{
  if(previous[src]&&previous[src].variants.every(v=>fs.existsSync('public'+v.src))){manifest[src]=previous[src];return}
  if(!/\.(?:jpe?g|png|webp)(?:\?|$)/i.test(src))return;
  const local=src.startsWith('/assets/')||src.startsWith('../assets/');
  const localSrc=src.replace(/^\.\.\//,'/');
  const stem=local?path.basename(localSrc,path.extname(localSrc)):'remote-'+crypto.createHash('sha256').update(src).digest('hex').slice(0,16);
  const cache='qa/image-originals/'+stem+path.extname(new URL(src,'https://aitscctv.com').pathname);
  let bytes;
  if(local)bytes=fs.readFileSync('public'+localSrc);
  else if(fs.existsSync(cache))bytes=fs.readFileSync(cache);
  else{const response=await fetch(src,{signal:AbortSignal.timeout(25000)});if(!response.ok)throw Error('HTTP '+response.status);bytes=Buffer.from(await response.arrayBuffer());fs.mkdirSync('qa/image-originals',{recursive:true});fs.writeFileSync(cache,bytes)}
  const metadata=await sharp(bytes).metadata();
  if(metadata.pages>1)return; // Preserve animated media.
  const variants=[];
  for(const width of [...new Set([160,320,640,1280].map(w=>Math.min(w,metadata.width)))]){
   const target='/assets/'+stem+'-responsive-'+width+'.webp';
   await sharp(bytes).rotate().resize({width,withoutEnlargement:true}).webp({quality:width<=320?75:80}).toFile('public'+target);
   const result=await sharp('public'+target).metadata();
   variants.push({src:target,width:result.width,height:result.height,bytes:fs.statSync('public'+target).size});
  }
  manifest[src]={width:metadata.width,height:metadata.height,originalBytes:bytes.length,variants};
 }catch(error){failures.push({src,error:error.message})}
}
const queue=[...sources];await Promise.all(Array.from({length:6},async()=>{while(queue.length)await optimize(queue.shift())}));
const ordered=Object.fromEntries(Object.entries(manifest).sort(([a],[b])=>a.localeCompare(b)));
fs.writeFileSync('src/lib/image-assets.json',JSON.stringify(ordered,null,2));
fs.writeFileSync('qa/image-optimization.json',JSON.stringify({sources:sources.size,optimized:Object.keys(manifest).length,failures},null,2));
console.log(JSON.stringify({sources:sources.size,optimized:Object.keys(manifest).length,failures},null,2));
if(failures.length)process.exitCode=1;
