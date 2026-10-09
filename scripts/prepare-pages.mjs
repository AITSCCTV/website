import fs from 'node:fs';
import path from 'node:path';

// The captured design uses root-relative public assets. Next's basePath handles
// route links, but not raw image URLs or URLs inside the captured stylesheets.
// Rewrite the exported HTML, RSC payloads, JS and CSS together so hydration and
// subsequent navigation use the same public asset paths as the initial page.
if(process.env.GITHUB_PAGES!=='true')throw new Error('Set GITHUB_PAGES=true before building for Pages.');
function prepare(directory){
 for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);
  if(entry.isDirectory()){prepare(file);continue;}
  if(!/\.(html|txt|js|css|json)$/.test(entry.name))continue;
  const original=fs.readFileSync(file,'utf8');
  const rewritten=original.replace(/(?<![\w/.])\/(assets|pages)\//g,'/website/$1/');
  if(rewritten!==original)fs.writeFileSync(file,rewritten);
 }
}
prepare('out');
// GitHub Pages has no server redirect rules. Redirect the legacy article URL
// before downloading the app runtime, preserving its query and fragment. A
// no-JavaScript visitor also gets a redirect and the visible archive link.
const legacy='out/blog/index.html';
if(fs.existsSync(legacy)){
 const html=fs.readFileSync(legacy,'utf8');
 const redirect='<script>window.location.replace("/website/articles/"+window.location.search+window.location.hash)</script><noscript><meta http-equiv="refresh" content="0;url=/website/articles/"></noscript>';
 if(!html.includes('content="0;url=/website/articles/"'))fs.writeFileSync(legacy,html.replace('<head>','<head>'+redirect));
}
fs.writeFileSync('out/.nojekyll','');
console.log('Prepared static export for https://aitscctv.github.io/website/');
