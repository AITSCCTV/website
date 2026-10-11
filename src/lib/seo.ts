// Use the actual deployment URL, including the GitHub Pages project path.
export const SITE_URL=process.env.GITHUB_PAGES==='true'
 ? 'https://aitscctv.github.io/website'
 : 'https://aitscctv.com';
export const siteUrl=(path:string)=>SITE_URL+path;
export function pageDescription(description:string,title:string,language:'th'|'en'|'zh'){
 if(description.trim())return description;
 const subject=title.replace(/\s*[|–-]\s*AITSCCTV.*$/i,'');
 return language==='zh'?`${subject}。了解 AITSCCTV 在泰国提供的智能家居、视频监控、网络与安防系统服务，联系我们获取专业咨询。`
  :language==='en'?`${subject}. Explore AITSCCTV's CCTV, smart home, network and security solutions in Thailand. Contact our team for professional advice.`
  :`${subject} โดย AITSCCTV บริการออกแบบและติดตั้งกล้องวงจรปิด สมาร์ทโฮม ระบบเครือข่ายและความปลอดภัย พร้อมให้คำปรึกษาในประเทศไทย`;
}
