import {siteUrl,pageDescription} from '../../../../lib/seo';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {englishPages} from '../../../../generated/english-pages';
import {HeroPreload} from '../../../../components/HeroPreload';
import type {PagePath} from '../../../../generated/pages';

type Props={params:Promise<{slug:string[]}>};
export const dynamicParams=false;
const pathFor=(slug:string[])=>('/'+slug.join('/')+'/') as PagePath;
export function generateStaticParams(){return Object.keys(englishPages).filter(path=>path!=='/').map(path=>({slug:path.split('/').filter(Boolean)}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const path=pathFor((await params).slug),page=englishPages[path];
 return page?{title:page.title,description:pageDescription(page.description,page.title,'en'),alternates:{canonical:siteUrl('/en')+path,languages:{th:siteUrl('')+path,en:siteUrl('/en')+path,'zh-Hans':siteUrl('/zh')+path}}}:{title:'Page not found | AITSCCTV'};
}
export default async function EnglishPage({params}:Props){
 const path=pathFor((await params).slug),data=englishPages[path];if(!data)notFound();
 const {Component}=data;return <><HeroPreload path={path}/><link rel="stylesheet" href={'/pages/'+data.id+'.css'}/><Component/></>;
}
