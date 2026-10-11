import {siteUrl,pageDescription} from '../../../lib/seo';
import type {Metadata} from 'next';
import {HeroPreload} from '../../../components/HeroPreload';
import {notFound} from 'next/navigation';
import {pages,type PagePath} from '../../../generated/pages';
type Props={params:Promise<{slug?:string[]}>};
export const dynamicParams=false;
function pathFor(slug?:string[]){return (slug?.length?'/'+slug.join('/')+'/':'/') as PagePath}
export function generateStaticParams(){return Object.keys(pages).map(p=>({slug:p==='/'?[]:p.split('/').filter(Boolean)}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{const page=pages[pathFor((await params).slug)];return page?{title:page.title,description:pageDescription(page.description,page.title,'th'),alternates:{canonical:siteUrl('')+pathFor((await params).slug),languages:{th:siteUrl('')+pathFor((await params).slug),en:siteUrl('/en')+pathFor((await params).slug),'zh-Hans':siteUrl('/zh')+pathFor((await params).slug)}}}:{title:'ไม่พบหน้าที่ต้องการ'}}
export default async function Page({params}:Props){const data=pages[pathFor((await params).slug)];if(!data)notFound();const {Component}=data;return <><HeroPreload path={pathFor((await params).slug)}/><link rel="stylesheet" href={'/pages/'+data.id+'.css'}/><Component/></>}
