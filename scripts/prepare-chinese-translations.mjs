import fs from 'node:fs';
import {parseDocument} from 'htmlparser2';

const english={...JSON.parse(fs.readFileSync('src/lib/home-en.json')),...JSON.parse(fs.readFileSync('src/lib/site-en.json'))};
const texts=new Set(Object.values(english).map(t=>t.trim()).filter(Boolean));
const add=t=>{if(t?.trim()&&/[A-Za-z]/.test(t)&&!/[\u0e00-\u0e7f]/.test(t))texts.add(t.trim())};
for(const file of fs.readdirSync('src/generated').filter(f=>/^(EnglishPage\d+|HomeEnglish)\.tsx$/.test(f))){
 const source=fs.readFileSync('src/generated/'+file,'utf8');
 for(const match of source.matchAll(/\{("(?:[^"\\]|\\.)*")\}/g)){const prefix=source.slice(Math.max(0,match.index-35),match.index),attribute=prefix.match(/([\w-]+)=$/)?.[1];if(!attribute||['alt','title','aria-label','placeholder','value'].includes(attribute))add(JSON.parse(match[1]))}
}
for(const article of JSON.parse(fs.readFileSync('src/generated/english-editorial.json'))){add(article.title);add(article.description);const walk=n=>{if(n.type==='text')add(n.data);for(const k of ['alt','title','aria-label'])add(n.attribs?.[k]);for(const c of n.children||[])walk(c)};walk(parseDocument(article.body))}
for(const file of ['src/generated/english-pages.ts',...fs.readdirSync('src/components').filter(f=>f.endsWith('.tsx')).map(f=>'src/components/'+f)]){
 const source=fs.readFileSync(file,'utf8');
 for(const match of source.matchAll(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g)){const text=match[0].startsWith('"')?JSON.parse(match[0]):match[0].slice(1,-1).replace(/\\'/g,"'");if(/[A-Za-z]/.test(text)&&/\s/.test(text)&&!/^https?:|^\/|^\.|@|\b(?:px|calc|rgb)\b/.test(text))add(text)}
}
fs.mkdirSync('qa/chinese',{recursive:true});
fs.writeFileSync('qa/chinese/inventory.json',JSON.stringify([...texts],null,2));
const output='src/lib/site-zh.json',dictionary=fs.existsSync(output)?JSON.parse(fs.readFileSync(output)):{};
// Public, already-published copy only. Translation is a preparation step;
// the deployed website uses this versioned dictionary without API requests.
const pending=[...texts].filter(t=>!dictionary[t]),batches=[];let batch=[],length=0;
for(const text of pending){if(length+text.length>2600&&batch.length){batches.push(batch);batch=[];length=0}batch.push(text);length+=text.length+14}if(batch.length)batches.push(batch);
console.log(JSON.stringify({texts:texts.size,characters:[...texts].join('').length,pending:pending.length,batches:batches.length}));
let cursor=0,finished=0;
async function request(text){for(let attempt=0;attempt<4;attempt++){try{const response=await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q='+encodeURIComponent(text),{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Translation HTTP '+response.status);const data=await response.json();return data[0].map(row=>row[0]).join('')}catch(e){if(attempt===3)throw e;await new Promise(r=>setTimeout(r,1500*(attempt+1)))}}}
await Promise.all(Array.from({length:2},async()=>{while(cursor<batches.length){const current=batches[cursor++];const result=await request(current.map((t,i)=>`[[${i}]]\n${t}`).join('\n'));const markers=[...result.matchAll(/\[\[\s*(\d+)\s*\]\]/g)];if(markers.length===current.length){for(let i=0;i<markers.length;i++){const key=Number(markers[i][1]);if(key!==i)throw Error('Translation marker mismatch');dictionary[current[i]]=result.slice(markers[i].index+markers[i][0].length,markers[i+1]?.index??result.length).trim()}}else{for(const text of current)dictionary[text]=(await request(text)).trim()}
fs.writeFileSync(output,JSON.stringify(dictionary,null,2));finished++;if(finished%10===0||finished===batches.length)console.log('Translated batches',finished,'/',batches.length);await new Promise(r=>setTimeout(r,150));}}));
console.log('Chinese translations saved:',Object.keys(dictionary).length);
