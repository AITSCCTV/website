import home from './home-en.json';
import site from './site-en.json';

const catalogue:Record<string,string>={...home,...site};
export function translateText(text:string,english=true){return english?(catalogue[text.trim()]||text):text}
export function translateData<T>(data:T):T{
 if(typeof data==='string')return translateText(data) as T;
 if(Array.isArray(data))return data.map(value=>translateData(value)) as T;
 if(data&&typeof data==='object')return Object.fromEntries(Object.entries(data).map(([key,value])=>[key,['href','image','srcSet','original'].includes(key)?value:translateData(value)])) as T;
 return data;
}
