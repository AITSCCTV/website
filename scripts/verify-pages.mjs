import fs from 'node:fs';
import path from 'node:path';
import {parseDocument} from 'htmlparser2';

const root=path.resolve('out'),origin='https://aitscctv.github.io';
const issues=[],checked=new Set();
function check(value,from){
 if(!value||value.startsWith('#')||/^(data|mailto|tel|javascript):/.test(value))return;
 const url=new URL(value,origin+'/website/'+path.relative(root,from).replaceAll('\\','/'));
 if(url.origin!==origin)return;
 if(!url.pathname.startsWith('/website/')){issues.push(`${from}: URL outside project path: ${value}`);return;}
 const relative=decodeURIComponent(url.pathname.slice('/website/'.length));
 const file=path.resolve(root,relative||'index.html');
 if(!file.startsWith(root+path.sep)&&file!==root){issues.push(`Invalid local path: ${value}`);return;}
 const target=fs.existsSync(file)&&fs.statSync(file).isDirectory()?path.join(file,'index.html'):file;
 checked.add(target);
 if(!fs.existsSync(target))issues.push(`${from}: missing ${value}`);
}
function visit(node,file){
 for(const key of ['src','href','poster'])check(node.attribs?.[key],file);
 for(const child of node.children||[])visit(child,file);
}
let pages=0;
function audit(directory){
 for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);
  if(entry.isDirectory()){audit(file);continue;}
  if(entry.name.endsWith('.html')){pages++;visit(parseDocument(fs.readFileSync(file,'utf8')),file);}
  if(entry.name.endsWith('.css'))for(const match of fs.readFileSync(file,'utf8').matchAll(/url\(["']?([^"')]+)["']?\)/g))check(match[1],file);
 }
}
audit(root);
for(const route of ['/','/en/','/articles/','/en/articles/'])check('/website'+route,path.join(root,'index.html'));
for(const file of ['404.html','robots.txt','sitemap.xml','.nojekyll'])if(!fs.existsSync(path.join(root,file)))issues.push(`Missing export file: ${file}`);
console.log(JSON.stringify({pages,localFiles:checked.size,issues},null,2));
if(issues.length)process.exitCode=1;
