import fs from 'node:fs';import {parseDocument} from 'htmlparser2';import {render} from 'dom-serializer';
const tags=new Set(['div','section','article','p','h1','h2','h3','h4','h5','h6','ul','ol','li','a','strong','em','b','i','span','br','hr','img','figure','figcaption','blockquote','table','thead','tbody','tr','th','td','caption','code','pre']);
export function generateEnglishEditorial(translations,images){
 const file='design-source/editorial/posts.json';if(!fs.existsSync(file))return {};
 const catalogue=[...JSON.parse(fs.readFileSync('src/generated/articles.json')),...JSON.parse(fs.readFileSync('src/generated/portfolio.json'))];
 const plain=n=>n.type==='text'?n.data:(n.children||[]).map(plain).join('');
 const t=text=>translations[text.trim()]||text;
 const posts=JSON.parse(fs.readFileSync(file)),links={};
 const routes=new Set(JSON.parse(fs.readFileSync('design-source/routes.json')).map(route=>route.path));
 routes.add('/articles/');routes.add('/blog/');
 for(const post of posts){const title=plain(parseDocument(post.title.rendered));const enTitle=t(title);const slug=enTitle.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,72)||'article';links[post.link]='/en/articles/'+post.id+'-'+slug+'/'}
 const safeHref=href=>{try{const url=new URL(href,'https://aitscctv.com');if(!['https:','http:','tel:','mailto:'].includes(url.protocol))return undefined;
  const original=new URL(url.href);original.search='';original.hash='';
  const article=links[original.href];if(article)return article+url.search+url.hash;
  const path=url.pathname.endsWith('/')?url.pathname:url.pathname+'/';
  if(['aitscctv.com','www.aitscctv.com'].includes(url.hostname)&&routes.has(path))return '/en'+(path==='/blog/'?'/articles/':path)+url.search+url.hash;
  return url.href}catch{return undefined}};
 const articles=posts.map(post=>{
  const title=plain(parseDocument(post.title.rendered)),doc=parseDocument(post.content.rendered);
  function clean(node){
   if(node.type==='text'){node.data=t(node.data);return node}
   if(node.type!=='tag')return null;
   // One published source includes a drafting assistant's preface. It is not
   // article content or an instruction for this compiler; omit that paragraph.
   if(node.name==='p'&&plain(node).trim().startsWith('จัดให้เลยครับ แปลภาษาอังกฤษโดยคงสไตล์ Pro Content Creator ไว้'))return null;
   if(node.name==='iframe'){
    try{const video=new URL(node.attribs.src,'https://aitscctv.com');
     if(!['www.youtube.com','youtube.com','www.youtube-nocookie.com','player.vimeo.com'].includes(video.hostname)||video.protocol!=='https:')return null;
     const id=video.pathname.split('/').filter(Boolean).at(-1);
     if(!/^[a-zA-Z0-9_-]+$/.test(id||''))return null;
     const href=video.hostname==='player.vimeo.com'?'https://vimeo.com/'+id:'https://www.youtube.com/watch?v='+id;
     const link=parseDocument('<p><a>Watch the original video</a></p>').children[0];link.children[0].attribs.href=href;return link;
    }catch{return null}
   }
   if(!tags.has(node.name))return null;
   const attrs=node.attribs;node.attribs={};
   if(node.name==='h1')node.name='h2';
   if(node.name==='a'){const href=safeHref(attrs.href);if(href)node.attribs.href=href;else node.name='span'}
   if(node.name==='img'){
    if(!/^https:\/\/(?:www\.)?aitscctv.com\//.test(attrs.src||''))return null;
    const image=images[attrs.src];const variant=image?.variants.find(v=>v.width>=640)||image?.variants.at(-1);
    node.attribs={src:variant?.src||attrs.src,alt:t(attrs.alt||''),loading:'lazy',decoding:'async',...(attrs.width?{width:attrs.width}:{}),...(attrs.height?{height:attrs.height}:{})};
    if(image){node.attribs.width=String(image.width);node.attribs.height=String(image.height);node.attribs.srcset=image.variants.map(v=>v.src+' '+v.width+'w').join(', ');node.attribs.sizes='(max-width: 640px) calc(100vw - 40px), 840px'}
    else if(attrs.srcset){node.attribs.srcset=attrs.srcset;node.attribs.sizes='(max-width: 640px) calc(100vw - 40px), 840px'}
   }
   if(node.name==='th')node.attribs.scope=attrs.scope||'col';
   for(const key of ['colspan','rowspan'])if(/^\d+$/.test(attrs[key]||''))node.attribs[key]=attrs[key];
   node.children=(node.children||[]).map(clean).filter(Boolean);for(const child of node.children)child.parent=node;
   // Published HTML includes empty links left by the original editor. They
   // create unnamed keyboard stops; retain any media, otherwise remove them.
   if(node.name==='a'&&!plain(node).trim()&&!node.children.some(child=>child.name==='img'))return null;
   if(['div','section','article','span'].includes(node.name)&&!node.children.length)return null;
   return node;
  }
  doc.children=doc.children.map(clean).filter(Boolean);
  const summary=t(plain(parseDocument(post.excerpt.rendered))).trim();
  const card=catalogue.find(a=>a.href===post.link);
  return {id:post.id,href:links[post.link],original:post.link,title:t(title),description:summary,date:post.date,body:render(doc.children),image:card?.image,srcSet:card?.srcSet,width:card?.width,height:card?.height};
 });
 fs.writeFileSync('src/generated/english-editorial.json',JSON.stringify(articles,null,2));
 fs.writeFileSync('src/generated/english-editorial-index.json',JSON.stringify(articles.map(({id,href,original,title})=>({id,href,original,title})),null,2));
 fs.writeFileSync('src/generated/editorial-links.json',JSON.stringify(links,null,2));
 return links;
}
