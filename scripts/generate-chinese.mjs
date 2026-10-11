import fs from 'node:fs';import {parseDocument,DomUtils} from 'htmlparser2';
const dictionary=JSON.parse(fs.readFileSync('src/lib/site-zh.json'));
const overrides={
 'Home':'首页','Services':'服务项目','Our work':'项目案例','Project portfolio':'项目案例集','Videos':'视频','About us':'关于我们','Careers':'加入我们','Contact':'联系我们','Contact us':'联系我们','Articles':'文章','Language':'语言',
 'Skip to content':'跳转到正文','Open menu':'打开菜单','Close menu':'关闭菜单','Main navigation':'主导航','AITSCCTV home':'AITSCCTV 首页','Chat with us':'在线咨询','Technician login':'技术人员登录','Technician login (TH)':'技术人员登录（泰语）','ONE STOP SERVICE':'一站式服务','Copyright':'版权所有','Quick contact':'快捷联系','Contact AITSCCTV on LINE':'通过 LINE 联系 AITSCCTV',
 'Articles & project stories':'文章与项目案例','Search articles':'搜索文章','Read article →':'阅读全文 →','Article pages':'文章分页','Previous':'上一页','Next':'下一页','View project portfolio →':'查看项目案例 →','No matching articles. Try another search.':'未找到相关文章，请尝试其他关键词。','CCTV, smart home, network…':'监控摄像头、智能家居、网络…',
 'Free consultation':'免费咨询','ext. 100':'分机 100','Play video':'播放视频','AITSCCTV video':'AITSCCTV 视频','AITSCCTV videos':'AITSCCTV 视频','Watch on YouTube':'在 YouTube 观看','View all on YouTube':'在 YouTube 查看全部','Show more videos':'查看更多视频','OUR TEAM':'我们的团队','Main function':'主要功能',
 'Smart Home':'智能家居','Smart Office':'智能办公','Smart Building':'智能楼宇','Smart Industrial':'智能工业','CCTV':'视频监控','TYPE OF LAN CABLE':'网线类型','SECURITY SYSTEM':'安防系统',
 'AITSCCTV':'AITSCCTV','AITSCCTV.com':'AITSCCTV.com','WHY AITSCCTV':'为什么选择 AITSCCTV',
 'Contact A.I.T.S. Co., Ltd. | AITSCCTV':'联系 A.I.T.S. 有限公司 | AITSCCTV','Careers | AITSCCTV':'加入我们 | AITSCCTV','Videos | AITSCCTV':'视频 | AITSCCTV','CCTV Installation and Security Systems | AITSCCTV':'视频监控安装与安防系统 | AITSCCTV','Professional Home and Building Window Film Installation | AITSCCTV':'住宅与楼宇专业窗膜安装 | AITSCCTV',
 'Our experienced technicians design professional security installations around customer needs. We work locally, take responsibility for completing projects and remain available for service. Let us set a new standard for your security.':'我们的专业技术团队根据客户需求设计和安装安防系统，在项目所在地提供服务，负责项目交付并持续提供售后支持，为您的安全建立更高标准。',
 'Our work at AITSCCTV':'AITSCCTV 项目案例','Clients who trust AITSCCTV':'信赖 AITSCCTV 的客户','Project review: CCTV rental for events and exhibitions, designed around customer requirements':'项目案例：按客户需求为活动与展会提供监控设备租赁','Technicians registered with the company across Thailand.':'公司拥有覆盖泰国各地的注册技术人员。','Ask our team to assess the cost before you commit to the service.':'在确定服务前，请先联系我们评估费用。',
 '3. Clean, Professional Integration with Hidden Wiring':'3. 整洁专业的系统集成与隐蔽布线','through the walls and concealed for a sleek finish':'穿墙布线并隐藏线缆，保持外观整洁',
 'CAT 5e':'CAT 5e','CAT 6':'CAT 6','CAT 6a':'CAT 6a','CAT 6e':'CAT 6e','CAT 7 / 7e':'CAT 7 / 7e','CAT 8':'CAT 8','AITSCCTV clients':'AITSCCTV 客户','Pause logo animation':'暂停客户标志滚动','Resume logo animation':'继续客户标志滚动',
};
for(const [english,chinese]of Object.entries(dictionary)){dictionary[english]=chinese.replaceAll('中央电视台',english.includes('AITSCCTV')?'AITSCCTV':'视频监控').replaceAll('闭路电视','视频监控');if(english.startsWith('#'))dictionary[english]=english}
Object.assign(dictionary,overrides);fs.writeFileSync('src/lib/site-zh.json',JSON.stringify(dictionary,null,2));
const missing=new Set();
function translate(text){const key=text.trim();if(!key)return text;const value=dictionary[key];if(!value){if(/[A-Za-z]/.test(key))missing.add(key);return text}return text.slice(0,text.indexOf(key))+value+text.slice(text.indexOf(key)+key.length)}
function source(text){return text.replace(/\{("(?:[^"\\]|\\.)*")\}/g,(all,raw,index)=>{
 const value=JSON.parse(raw),attribute=text.slice(Math.max(0,index-40),index).match(/([\w-]+)=$/)?.[1];
 if(attribute==='href'&&value.startsWith('/en/'))return '{'+JSON.stringify(value.replace(/^\/en\//,'/zh/'))+'}';
 if(!attribute||['alt','title','aria-label','placeholder','value'].includes(attribute))return '{'+JSON.stringify(translate(value))+'}';
 return all;
 }).replace(/\b(title|description):("(?:[^"\\]|\\.)*")/g,(_,key,raw)=>key+':'+JSON.stringify(translate(JSON.parse(raw)))).replace(/EnglishPage/g,'ChinesePage').replace(/HomeEnglish/g,'HomeChinese').replace(/englishPages/g,'chinesePages').replace(/lang="en"/g,'lang="zh-Hans"').replace(/english=\{true\}/g,'english="zh"').replace(/<VideoLibrary english \/>/g,'<VideoLibrary english="zh" />')}
for(const name of fs.readdirSync('src/generated').filter(f=>/^(EnglishPage\d+|HomeEnglish)\.tsx$/.test(f)))fs.writeFileSync('src/generated/'+name.replace('EnglishPage','ChinesePage').replace('HomeEnglish','HomeChinese'),source(fs.readFileSync('src/generated/'+name,'utf8')));
fs.writeFileSync('src/generated/chinese-pages.ts',source(fs.readFileSync('src/generated/english-pages.ts','utf8')));
const articles=JSON.parse(fs.readFileSync('src/generated/english-editorial.json')).map(article=>{
 const doc=parseDocument(article.body),walk=n=>{if(n.type==='text')n.data=translate(n.data);for(const key of ['alt','title','aria-label'])if(n.attribs?.[key])n.attribs[key]=translate(n.attribs[key]);if(n.attribs?.href?.startsWith('/en/'))n.attribs.href=n.attribs.href.replace(/^\/en\//,'/zh/');for(const c of n.children||[])walk(c)};walk(doc);
 return {...article,title:translate(article.title),description:translate(article.description),href:article.href.replace(/^\/en\//,'/zh/'),english:article.href,body:DomUtils.getOuterHTML(doc)};
});
fs.writeFileSync('src/generated/chinese-editorial.json',JSON.stringify(articles,null,2));
fs.writeFileSync('src/generated/chinese-editorial-index.json',JSON.stringify(articles.map(({id,href,original,title})=>({id,href,original,title})),null,2));
fs.writeFileSync('src/generated/videos-zh.json',JSON.stringify(JSON.parse(fs.readFileSync('src/generated/videos-en.json')).map(v=>({...v,title:translate(v.title)})),null,2));
// Keep the full body dictionary out of client component bundles.
const ui={...overrides};for(const text of Object.values(JSON.parse(fs.readFileSync('src/lib/home-en.json'))))ui[text.trim()]=translate(text).trim();
for(const file of fs.readdirSync('src/components').filter(f=>f.endsWith('.tsx'))){const text=fs.readFileSync('src/components/'+file,'utf8');for(const m of text.matchAll(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g)){const value=m[0][0]==='"'?JSON.parse(m[0]):m[0].slice(1,-1).replace(/\\'/g,"'");if(dictionary[value.trim()])ui[value.trim()]=dictionary[value.trim()]}}
fs.writeFileSync('src/lib/ui-zh.json',JSON.stringify(ui,null,2));
fs.mkdirSync('qa/chinese',{recursive:true});fs.writeFileSync('qa/chinese/generation.json',JSON.stringify({articles:articles.length,missing:[...missing]},null,2));
console.log(JSON.stringify({articles:articles.length,uiEntries:Object.keys(ui).length,missing:missing.size}));if(missing.size)throw Error('Untranslated Chinese content; see qa/chinese/generation.json');
