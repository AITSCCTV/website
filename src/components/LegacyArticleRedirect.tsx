"use client";
import {useEffect} from 'react';
import {SiteLink} from './SiteLink';
export function LegacyArticleRedirect({destination,english=false}:{destination:string;english?:boolean}){
 useEffect(()=>{window.location.replace(destination+window.location.search+window.location.hash)},[destination]);
 return <section className="legacy-article-redirect"><h1>{english?'All articles are in our article archive':'บทความทั้งหมดอยู่ที่หน้ารวมบทความ'}</h1><p>{english?'Explore AITSCCTV articles, technical insights, and installation project stories in one place.':'ค้นหาบทความ ความรู้ และเรื่องราวงานติดตั้งของ AITSCCTV ได้ในที่เดียว'}</p><SiteLink prefetch={false} href={english?'/en/articles/':'/articles/'}>{english?'Open the article archive →':'ไปยังหน้ารวมบทความ →'}</SiteLink></section>;
}
