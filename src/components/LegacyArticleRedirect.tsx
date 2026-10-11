"use client";
import type {ContentLanguage} from '../lib/locale-path';
import {uiText} from '../lib/localization-ui';
import {useEffect} from 'react';
import {SiteLink} from './SiteLink';
export function LegacyArticleRedirect({destination,english=false}:{destination:string;english?:ContentLanguage}){
 useEffect(()=>{window.location.replace(destination+window.location.search+window.location.hash)},[destination]);
 return <section className="legacy-article-redirect"><h1>{english?uiText('All articles are in our article archive',english):'บทความทั้งหมดอยู่ที่หน้ารวมบทความ'}</h1><p>{english?uiText('Explore AITSCCTV articles, technical insights, and installation project stories in one place.',english):'ค้นหาบทความ ความรู้ และเรื่องราวงานติดตั้งของ AITSCCTV ได้ในที่เดียว'}</p><SiteLink prefetch={false} href={english==='zh'?'/zh/articles/':english?'/en/articles/':'/articles/'}>{english?uiText('Open the article archive →',english):'ไปยังหน้ารวมบทความ →'}</SiteLink></section>;
}
