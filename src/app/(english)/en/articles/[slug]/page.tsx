import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {SiteLink} from '../../../../../components/SiteLink';
import articles from '../../../../../generated/english-editorial.json';

type Props={params:Promise<{slug:string}>};
export const dynamicParams=false;
const slugFor=(href:string)=>href.split('/').filter(Boolean).at(-1);
export function generateStaticParams(){return articles.map(article=>({slug:slugFor(article.href)}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const slug=(await params).slug,article=articles.find(a=>slugFor(a.href)===slug);
 return article?{title:article.title+' | AITSCCTV',description:article.description,alternates:{canonical:'https://aitscctv.com'+article.href,languages:{th:article.original,en:'https://aitscctv.com'+article.href}}}:{title:'Article not found | AITSCCTV'};
}
export default async function EnglishArticle({params}:Props){
 const slug=(await params).slug,article=articles.find(a=>slugFor(a.href)===slug);if(!article)notFound();
 const body=process.env.GITHUB_PAGES==='true'?article.body.replace(/href="\/en\//g,'href="/website/en/'):article.body;
 return <article className="english-editorial" lang="en">
  <SiteLink prefetch={false} className="english-editorial-back" href="/en/articles/">← Articles & project stories</SiteLink>
  <h1>{article.title}</h1>
  <time dateTime={article.date}>{new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Bangkok'}).format(new Date(article.date+'+07:00'))}</time>
  <div className="english-editorial-body" dangerouslySetInnerHTML={{__html:body}}/>
  <aside className="english-editorial-contact"><h2>Discuss your project with AITS</h2><p>Tell us about your property, requirements and budget.</p><SiteLink prefetch={false} href="/en/contact/">Contact our team →</SiteLink><a href={article.original} lang="th">Read the original Thai article →</a></aside>
 </article>;
}
