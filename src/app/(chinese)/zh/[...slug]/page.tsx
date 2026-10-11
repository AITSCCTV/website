import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {chinesePages} from '../../../../generated/chinese-pages';
import {HeroPreload} from '../../../../components/HeroPreload';
import type {PagePath} from '../../../../generated/pages';

type Props={params:Promise<{slug:string[]}>};
export const dynamicParams=false;
const pathFor=(slug:string[])=>('/'+slug.join('/')+'/') as PagePath;
export function generateStaticParams(){return Object.keys(chinesePages).filter(path=>path!=='/').map(path=>({slug:path.split('/').filter(Boolean)}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const path=pathFor((await params).slug),page=chinesePages[path];
 return page?{title:page.title,description:page.description,alternates:{canonical:'https://aitscctv.com/zh'+path,languages:{th:'https://aitscctv.com'+path,en:'https://aitscctv.com/en'+path,'zh-Hans':'https://aitscctv.com/zh'+path}}}:{title:'页面未找到 | AITSCCTV'};
}
export default async function ChinesePage({params}:Props){
 const path=pathFor((await params).slug),data=chinesePages[path];if(!data)notFound();
 const {Component}=data;return <><HeroPreload path={path}/><link rel="stylesheet" href={'/pages/'+data.id+'.css'}/><Component/></>;
}
