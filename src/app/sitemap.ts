import type {MetadataRoute} from 'next';
export const dynamic='force-static';
import {pages} from '../generated/pages';
import articles from '../generated/english-editorial.json';
export default function sitemap():MetadataRoute.Sitemap{return [...Object.keys(pages),'/articles/',...Object.keys(pages).map(path=>'/en'+path),'/en/articles/',...articles.map(article=>article.href)].map(path=>({url:'https://aitscctv.com'+path}))}
