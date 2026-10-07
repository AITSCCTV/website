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
fs.writeFileSync('out/.nojekyll','');
console.log('Prepared static export for https://aitscctv.github.io/website/');
