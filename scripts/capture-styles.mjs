import fs from 'node:fs';

export function writeCaptureStyles(pages){
 const records=pages.flatMap(page=>[...page.css.matchAll(/(\.v\d+(?:::(?:before|after))?)\{([^}]+)\}/g)].filter(m=>page.used.has(m[1].match(/v\d+/)[0])).map(m=>({page,selector:'.page-'+page.id+' '+m[1],props:new Map([...m[2].matchAll(/([^:;]+):([^;]*)(?:;|$)/g)].map(m=>[m[1],m[2]]))})));
 // Only share properties explicitly present in every captured rule. Properties
 // absent in some rules must retain their normal inheritance/default behavior.
 const shared=new Map();
 for(const key of records[0].props.keys()){
  if(!records.every(r=>r.props.has(key)))continue;
  const counts=new Map();for(const r of records){const value=r.props.get(key);counts.set(value,(counts.get(value)||0)+1)}
  const [value,count]=[...counts].sort((a,b)=>b[1]-a[1])[0];
  if(count>records.length*.5)shared.set(key,value);
 }
 const serialize=props=>[...props].map(([k,v])=>k+':'+v).join(';');
 const base=serialize(shared);
 fs.writeFileSync('public/pages/shared.css','.captured-page .captured-style,.captured-page .captured-style::before,.captured-page .captured-style::after{'+base+'}');
 let before=0,after=Buffer.byteLength(base);
 for(const page of pages){
  const groups=new Map();
  for(const r of records.filter(r=>r.page===page)){
   const remaining=new Map([...r.props].filter(([k,v])=>shared.get(k)!==v));
   const body=serialize(remaining);if(!body)continue;
   if(!groups.has(body))groups.set(body,[]);groups.get(body).push(r.selector);
  }
  const css=[...groups].map(([body,selectors])=>selectors.join(',')+'{'+body+'}').join('\n')+page.phoneBackgrounds;
  fs.writeFileSync('public/pages/'+page.id+'.css',css);
  before+=Buffer.byteLength(page.css);after+=Buffer.byteLength(css);
 }
 console.log('Captured CSS: '+Math.round(before/1024)+' KB → '+Math.round(after/1024)+' KB, '+shared.size+' shared declarations.');
}
