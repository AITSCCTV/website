import home from './home-en.json';
import site from './site-en.json';
import chinese from './site-zh.json';
import type {ContentLanguage} from './locale-path';

const catalogue:Record<string,string>={...home,...site};
export function translateText(text:string,english:ContentLanguage=true){const en=catalogue[text.trim()]||text;return english==='zh'?((chinese as Record<string,string>)[en.trim()]||en):english?en:text}
export function translateData<T>(data:T,english:ContentLanguage=true):T{
 if(typeof data==='string')return translateText(data,english) as T;
 if(Array.isArray(data))return data.map(value=>translateData(value,english)) as T;
 if(data&&typeof data==='object')return Object.fromEntries(Object.entries(data).map(([key,value])=>[key,['href','image','srcSet','original'].includes(key)?value:translateData(value,english)])) as T;
 return data;
}
