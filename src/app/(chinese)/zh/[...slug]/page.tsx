import {PageStyles} from '../../../../components/PageStyles';
import {siteUrl,pageDescription} from '../../../../lib/seo';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {chinesePages} from '../../../../generated/chinese-pages';
import {HeroPreload} from '../../../../components/HeroPreload';
import {PageIdentity} from '../../../../components/StructuredData';
import type {PagePath} from '../../../../generated/pages';

type Props={params:Promise<{slug:string[]}>};
export const dynamicParams=false;
const pathFor=(slug:string[])=>('/'+slug.join('/')+'/') as PagePath;
export function generateStaticParams(){return Object.keys(chinesePages).filter(path=>path!=='/').map(path=>({slug:path.split('/').filter(Boolean)}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const path=pathFor((await params).slug),page=chinesePages[path];
 return page?{title:page.title,description:pageDescription(page.description,page.title,'zh'),alternates:{canonical:siteUrl('/zh')+path,languages:{th:siteUrl('')+path,en:siteUrl('/en')+path,'zh-Hans':siteUrl('/zh')+path}}}:{title:'页面未找到 | AITSCCTV'};
}
export default async function ChinesePage({params}:Props){
 const path=pathFor((await params).slug),data=chinesePages[path];if(!data)notFound();
 const {Component}=data;return <><PageIdentity path={'/zh'+path} title={data.title} description={pageDescription(data.description,data.title,'zh')} language="zh-Hans"/><HeroPreload path={path}/><PageStyles id={String(data.id)}/><Component/></>;
}
