import fs from 'node:fs';
import path from 'node:path';

// The captured design uses root-relative public assets. Next's basePath handles
// route links, but not raw image URLs or URLs inside the captured stylesheets.
// Rewrite the exported HTML, RSC payloads, JS and CSS together so hydration and
// subsequent navigation use the same public asset paths as the initial page.
if(process.env.GITHUB_PAGES!=='true')throw new Error('Set GITHUB_PAGES=true before building for Pages.');
const rewriteAssets=text=>text.replace(/(?<![\w/.])\/(assets|pages)\//g,'/website/$1/');
// Flight's large text records declare their UTF-8 byte length. Changing image
// paths without updating that length corrupts article hydration/navigation.
function rewriteFlight(text){
 const bytes=Buffer.from(text),parts=[];let offset=0;
 while(offset<bytes.length){
  const rest=bytes.subarray(offset).toString();
  const record=rest.match(/^([0-9a-f]+):T([0-9a-f]+),/);
  if(record){
   const start=offset+Buffer.byteLength(record[0]),end=start+parseInt(record[2],16);
   const payload=rewriteAssets(bytes.subarray(start,end).toString());
   parts.push(`${record[1]}:T${Buffer.byteLength(payload).toString(16)},${payload}`);offset=end;
  }else{
   const newline=bytes.indexOf(10,offset),end=newline<0?bytes.length:newline+1;
   parts.push(rewriteAssets(bytes.subarray(offset,end).toString()));offset=end;
  }
 }
 return parts.join('');
}
function rewriteHtml(html){
 const pattern=/<script>self\.__next_f\.push\((\[1,[\s\S]*?\])\)<\/script>/g;
 const chunks=[...html.matchAll(pattern)];
 if(!chunks.length)return rewriteAssets(html);
 const flight=rewriteFlight(chunks.map(m=>JSON.parse(m[1])[1]).join(''));
 let first=true;
 // Rejoin streamed chunks before rewriting: text records can cross chunks.
 const protectedHtml=html.replace(pattern,()=>{if(!first)return '';first=false;return 'FLIGHT_PAYLOAD_PLACEHOLDER';});
 return rewriteAssets(protectedHtml).replace('FLIGHT_PAYLOAD_PLACEHOLDER',`<script>self.__next_f.push(${JSON.stringify([1,flight]).replace(/</g,'\\u003c')})</script>`);
}
function prepare(directory){
 for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);
  if(entry.isDirectory()){
   prepare(file);
   // Next's Windows exporter can leave segment-cache files in directories,
   // while its browser router requests the same segments as dotted filenames.
   if(entry.name.startsWith('__next.')){
    const flatten=directory=>{for(const child of fs.readdirSync(directory,{withFileTypes:true})){
     const source=path.join(directory,child.name);
     if(child.isDirectory())flatten(source);
     else if(child.name.endsWith('.txt'))fs.copyFileSync(source,path.join(path.dirname(file),entry.name+'.'+path.relative(file,source).split(path.sep).join('.')));
    }};flatten(file);
   }
   continue;
  }
  if(!/\.(html|txt|js|css|json)$/.test(entry.name))continue;
  const original=fs.readFileSync(file,'utf8');
  const rewritten=entry.name.endsWith('.html')?rewriteHtml(original):entry.name.endsWith('.txt')?rewriteFlight(original):rewriteAssets(original);
  if(rewritten!==original)fs.writeFileSync(file,rewritten);
 }
}
prepare('out');
// GitHub Pages has no server redirect rules. Redirect the legacy article URL
// before downloading the app runtime, preserving its query and fragment. A
// no-JavaScript visitor also gets a redirect and the visible archive link.
for(const locale of ['', 'en/']){
 const legacy=`out/${locale}blog/index.html`,destination=`/website/${locale}articles/`;
 if(!fs.existsSync(legacy))continue;
 const html=fs.readFileSync(legacy,'utf8');
 const redirect=`<script>window.location.replace("${destination}"+window.location.search+window.location.hash)</script><noscript><meta http-equiv="refresh" content="0;url=${destination}"></noscript>`;
 if(!html.includes(`content="0;url=${destination}"`))fs.writeFileSync(legacy,html.replace('<head>','<head>'+redirect));
}
fs.writeFileSync('out/.nojekyll','');
console.log('Prepared static export for https://aitscctv.github.io/website/');
