"use client";
import {useEffect} from 'react';
import {SiteLink} from './SiteLink';
export function LegacyArticleRedirect({destination}:{destination:string}){
 useEffect(()=>{window.location.replace(destination+window.location.search+window.location.hash)},[destination]);
 return <section className="legacy-article-redirect"><h1>บทความทั้งหมดอยู่ที่หน้ารวมบทความ</h1><p>ค้นหาบทความ ความรู้ และเรื่องราวงานติดตั้งของ AITSCCTV ได้ในที่เดียว</p><SiteLink prefetch={false} href="/articles/">ไปยังหน้ารวมบทความ →</SiteLink></section>;
}
