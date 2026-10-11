import {siteUrl} from '../../../../../lib/seo';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {SiteLink} from '../../../../../components/SiteLink';
import articles from '../../../../../generated/chinese-editorial.json';

type Props={params:Promise<{slug:string}>};
export const dynamicParams=false;
const slugFor=(href:string)=>href.split('/').filter(Boolean).at(-1);
export function generateStaticParams(){return articles.map(article=>({slug:slugFor(article.href)}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const slug=(await params).slug,article=articles.find(a=>slugFor(a.href)===slug);
 return article?{title:article.title+' | AITSCCTV',description:article.description,alternates:{canonical:siteUrl('')+article.href,languages:{th:article.original,en:siteUrl('')+article.english,'zh-Hans':siteUrl('')+article.href}}}:{title:'文章未找到 | AITSCCTV'};
}
export default async function ChineseArticle({params}:Props){
 const slug=(await params).slug,article=articles.find(a=>slugFor(a.href)===slug);if(!article)notFound();
 const body=process.env.GITHUB_PAGES==='true'?article.body.replace(/href="\/zh\//g,'href="/website/zh/'):article.body;
 return <article className="english-editorial" lang="zh-Hans">
  <SiteLink prefetch={false} className="english-editorial-back" href="/zh/articles/">← 文章与项目案例</SiteLink>
  <h1>{article.title}</h1>
  <time dateTime={article.date}>{new Intl.DateTimeFormat('zh-CN',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Bangkok'}).format(new Date(article.date+'+07:00'))}</time>
  <div className="english-editorial-body" dangerouslySetInnerHTML={{__html:body}}/>
  <aside className="english-editorial-contact"><h2>与 AITS 沟通您的项目需求</h2><p>请告诉我们您的场地情况、需求和预算。</p><SiteLink prefetch={false} href="/zh/contact/">联系我们 →</SiteLink><a href={article.original} hrefLang="th">阅读泰语原文 →</a></aside>
 </article>;
}
