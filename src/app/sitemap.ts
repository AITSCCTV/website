import {siteUrl} from '../lib/seo';
import type {MetadataRoute} from 'next';
export const dynamic='force-static';
import {pages} from '../generated/pages';
import articles from '../generated/english-editorial.json';
import chineseArticles from '../generated/chinese-editorial.json';
export default function sitemap():MetadataRoute.Sitemap{return [...Object.keys(pages).filter(path=>path!=='/blog/'),'/articles/',...Object.keys(pages).filter(path=>path!=='/blog/').map(path=>'/en'+path),'/en/articles/',...articles.map(article=>article.href),...Object.keys(pages).filter(path=>path!=='/blog/').map(path=>'/zh'+path),'/zh/articles/',...chineseArticles.map(article=>article.href)].map(path=>({url:siteUrl(path)}))}
