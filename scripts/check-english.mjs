import fs from 'node:fs';import {parseDocument} from 'htmlparser2';
const thai=/[\u0e00-\u0e7f]/;const missing=[];
const catalogue={...JSON.parse(fs.readFileSync('src/lib/home-en.json')),...JSON.parse(fs.readFileSync('src/lib/site-en.json'))};
const translate=value=>catalogue[value.trim()]||value;
// Native components translate these catalogues at render time, so checking only
// generated JSX would miss service copy, warranties, project cards and image alt text.
function inspectData(value,file,field=''){
 if(typeof value==='string'){if(!['href','image','srcSet','original'].includes(field.split('.').at(-1))&&thai.test(translate(value)))missing.push({file,field,text:value});return}
 if(Array.isArray(value)){value.forEach((item,index)=>inspectData(item,file,field+'.'+index));return}
 if(value&&typeof value==='object')for(const [key,item]of Object.entries(value))inspectData(item,file,field?field+'.'+key:key);
}
for(const file of ['service-content.json','team-gallery.json','videos-en.json'])inspectData(JSON.parse(fs.readFileSync('src/generated/'+file)),file);
for(const match of fs.readFileSync('src/generated/english-pages.ts','utf8').matchAll(/(?:title|description):("(?:[^"\\]|\\.)*")/g)){const value=JSON.parse(match[1]);if(thai.test(value))missing.push({file:'english-pages.ts',field:'metadata',text:value})}
for(const file of fs.readdirSync('src/generated').filter(f=>/^EnglishPage\d+\.tsx$/.test(f))){for(const match of fs.readFileSync('src/generated/'+file,'utf8').matchAll(/"(?:[^"\\]|\\.)*"/g)){const value=JSON.parse(match[0]);if(thai.test(value)&&!/^https?:|^\//.test(value))missing.push({file,text:value})}}
for(const article of JSON.parse(fs.readFileSync('src/generated/english-editorial.json'))){for(const key of ['title','description'])if(thai.test(article[key]))missing.push({file:article.href,field:key,text:article[key]});const walk=n=>{if(n.type==='text'&&thai.test(n.data))missing.push({file:article.href,field:'body',text:n.data.trim()});for(const key of ['alt','title','aria-label'])if(thai.test(n.attribs?.[key]||''))missing.push({file:article.href,field:key,text:n.attribs[key]});for(const c of n.children||[])walk(c)};walk(parseDocument(article.body))}
fs.mkdirSync('qa/english',{recursive:true});fs.writeFileSync('qa/english/release-coverage.json',JSON.stringify({ready:missing.length===0,untranslatedOccurrences:missing.length,missing},null,2));console.log(JSON.stringify({ready:missing.length===0,untranslatedOccurrences:missing.length}));if(missing.length&&!process.argv.includes('--report'))process.exitCode=1;
