import type {MetadataRoute} from 'next';
export const dynamic='force-static';
import {pages} from '../generated/pages';
export default function sitemap():MetadataRoute.Sitemap{return [...Object.keys(pages),'/articles/','/en/','/en/articles/'].map(path=>({url:'https://aitscctv.com'+path}))}
