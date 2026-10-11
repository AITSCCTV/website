import {siteUrl} from '../lib/seo';
import {services} from '../lib/navigation';

const organizationId='https://aitscctv.com/#organization';
const websiteId=siteUrl('/#website');
export function StructuredData({data}:{data:Record<string,unknown>}){
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,'\\u003c')}}/>;
}

// Company facts already visible in the shared footer. No unverified ratings,
// opening hours, certifications, service-area or author claims are included.
export function BusinessIdentity(){return <StructuredData data={{
 '@context':'https://schema.org','@graph':[
  {'@type':'LocalBusiness','@id':organizationId,name:'AITSCCTV',url:'https://aitscctv.com/',
   logo:siteUrl('/assets/d32bdcfe9b2edc06-responsive-320.webp'),telephone:'+66-2-878-2951',email:'info@aitscctv.com',
   address:{'@type':'PostalAddress',streetAddress:'570 Charoen Nakhon Road, Bukkhalo',addressLocality:'Thon Buri',addressRegion:'Bangkok',postalCode:'10600',addressCountry:'TH'},
   sameAs:['https://www.facebook.com/aitscctv','https://www.instagram.com/aitscctv/','https://www.youtube.com/channel/UCFbUfMSCQ33eiTORaMJZjlQ']},
  {'@type':'WebSite','@id':websiteId,url:siteUrl('/'),name:'AITSCCTV',publisher:{'@id':organizationId},inLanguage:['th','en','zh-Hans']},
 ]}}/>}

export function PageIdentity({path,title,description,language,collection=false}:{path:string;title:string;description:string;language:string;collection?:boolean}){
 const servicePath=path.replace(/^\/(en|zh)(?=\/)/,'');
 const isService=services.some(([,href])=>href===servicePath);
 return <StructuredData data={{'@context':'https://schema.org','@type':collection?'CollectionPage':'WebPage',
  '@id':siteUrl(path)+'#webpage',url:siteUrl(path),name:title,description,inLanguage:language,
  isPartOf:{'@id':websiteId},about:{'@id':organizationId},
  ...(isService?{mainEntity:{'@type':'Service',name:title,description,url:siteUrl(path),provider:{'@id':organizationId}}}:{}),
 }}/>;
}

export function ArticleIdentity({article,language}:{article:{href:string;title:string;description:string;date:string;original:string;image?:string|null};language:string}){
 return <StructuredData data={{'@context':'https://schema.org','@type':'Article',
  '@id':siteUrl(article.href)+'#article',url:siteUrl(article.href),headline:article.title,description:article.description,
  inLanguage:language,datePublished:article.date+'+07:00',publisher:{'@id':organizationId},
  mainEntityOfPage:{'@type':'WebPage','@id':siteUrl(article.href)},isPartOf:{'@id':websiteId},
  ...(article.image?{image:siteUrl(article.image)}:{}),
  translationOfWork:{'@type':'Article',url:article.original,inLanguage:'th'},
 }}/>;
}
