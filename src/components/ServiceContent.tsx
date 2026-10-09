import content from '../generated/service-content.json';
import gallery from '../generated/team-gallery.json';
import {SiteLink} from './SiteLink';

type Image={image?:string;srcSet?:string;width?:number;height?:number};
type Project=Image&{title:string;href:string;kind:string};
type Service={label:string;points:string[];context:string;projects:Project[];warranties:string[];hasPublishedPrices:boolean};
const service=(path:string)=>(content as Record<string,Service>)[path];
const quotation='https://docs.google.com/forms/d/e/1FAIpQLSdB3VqQ5hoTTrXIbbitcY-3NUoRikdHlloTxfnEPzHm-r15kA/viewform';
const stages=[['overview','ภาพรวมบริการ'],['benefits','ประโยชน์'],['options','รูปแบบและราคา'],['projects','ผลงานที่เกี่ยวข้อง'],['contact','ติดต่อทีมงาน']] as const;

export function ServiceContents(){return <nav className="service-contents" aria-label="หัวข้อบริการ">{stages.map(([id,label])=><a key={id} href={'#service-'+id}>{label}</a>)}</nav>}
export function ServiceTrust(){return <aside className="service-trust"><p>AITSCCTV ออกแบบและติดตั้งโดยทีมงานมืออาชีพ พร้อมดูแลหลังส่งมอบงาน</p><SiteLink prefetch={false} href="/about-us/#our-team">รู้จักทีมงานของเรา →</SiteLink></aside>}
export function ServiceBenefits({path}:{path:string}){return <ul className="service-benefit-list">{service(path).points.map(point=><li key={point}>{point}</li>)}</ul>}
export function ServicePricing({path}:{path:string}){const data=service(path);return <p className="service-pricing-note">{data.hasPublishedPrices?'กรุณายืนยันราคา อุปกรณ์ และเงื่อนไขกับทีมงานก่อนตัดสินใจ':'ค่าบริการประเมินตามพื้นที่ อุปกรณ์ และขอบเขตงาน ติดต่อทีมงานเพื่อขอใบเสนอราคา'} <a href="#service-contact">ขอใบเสนอราคา →</a></p>}
export function ServiceWarranty({path}:{path:string}){const data=service(path);return data.warranties.length?<aside className="service-warranty"><h3>การรับประกันของบริการนี้</h3>{data.warranties.map(text=><p key={text}>{text}</p>)}<a href="#service-contact">สอบถามเงื่อนไขการรับประกันเพิ่มเติม →</a></aside>:null}
export function ServiceProjects({path}:{path:string}){
 const data=service(path);
 return <div className="service-projects">{data.context&&<p className="service-project-context">{data.context}</p>}{data.projects.length?<div className="service-project-grid">{data.projects.map(project=><article key={project.href} className="service-project-card">{project.image&&<a href={project.href} tabIndex={-1} aria-hidden="true"><img src={project.image} srcSet={project.srcSet} sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1024px) 45vw, 370px" width={project.width} height={project.height} alt="" loading="lazy" decoding="async"/></a>}<div><p className="service-project-type">{project.kind==='project'?'ผลงานที่เกี่ยวข้อง':'บทความที่เกี่ยวข้อง'}</p><h3><a href={project.href}>{project.title}</a></h3><a className="service-project-read" href={project.href}>อ่านรายละเอียด →</a></div></article>)}</div>:<div className="service-project-request"><p>ต้องการดูตัวอย่างงาน{data.label}ที่เหมาะกับพื้นที่ของคุณ?</p><p>ติดต่อทีมงานเพื่อสอบถามตัวอย่างงานและแนวทางออกแบบ</p><a href="#service-contact">สอบถามตัวอย่างงาน →</a></div>}<SiteLink prefetch={false} className="service-portfolio-link" href="/our-standard/">ดูผลงานที่ผ่านมา →</SiteLink></div>;
}
export function ServiceContact({path}:{path:string}){return <div className="service-contact"><h3>ปรึกษาเรื่อง{service(path).label}</h3><p>แจ้งพื้นที่ใช้งาน ความต้องการ และงบประมาณ เพื่อให้ทีมงานช่วยประเมินขอบเขตงาน</p><div className="service-contact-actions"><a className="service-quote" href={quotation} target="_blank" rel="noopener">ขอใบเสนอราคา</a><a className="service-line" href="https://lin.ee/ZianhmV" target="_blank" rel="noopener">คุยผ่าน LINE</a><a className="service-call" href="tel:0944606196">โทร 094 460 6196</a></div><a href="mailto:info@aitscctv.com">info@aitscctv.com</a></div>}
export function AboutTeamGallery(){
 const images=(items:typeof gallery)=><div className="about-team-grid">{items.map((item,i)=><a href={item.original} key={item.original} target="_blank" rel="noopener" aria-label={'เปิดภาพงานติดตั้ง '+(item.alt||String(i+1))}><img src={item.image} srcSet={item.srcSet} sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 270px" width={item.width} height={item.height} alt={/[\u0e00-\u0e7f]/.test(item.alt)?item.alt:'ภาพงานติดตั้งและมาตรฐานการทำงานของ AITSCCTV'} loading="lazy" decoding="async"/></a>)}</div>;
 return <section id="our-team" className="about-team"><p className="eyebrow">OUR TEAM</p><h2>ทีมงานของเรา AITSCCTV</h2><p>พวกเรา AITSCCTV พร้อมสร้างมาตรฐานความปลอดภัยใหม่ให้คุณ</p>{images(gallery.slice(0,8))}<details className="about-team-more"><summary>ดูภาพงานติดตั้งเพิ่มเติม ({gallery.length-8} ภาพ)</summary>{images(gallery.slice(8))}</details></section>;
}
