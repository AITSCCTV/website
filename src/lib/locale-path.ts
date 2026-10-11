export type ContentLanguage=boolean|'zh';
export function languageFor(path:string){const clean=path.replace(/^\/website(?=\/|$)/,'');return /^\/zh(?:\/|$)/.test(clean)?'zh':/^\/en(?:\/|$)/.test(clean)?'en':'th'}
export function thaiPath(path:string){return path.replace(/^\/website(?=\/|$)/,'').replace(/^\/(?:en|zh)(?=\/|$)/,'')||'/'}
export function localePath(path:string,english:ContentLanguage){
 if(!path.startsWith('/')||path.startsWith('//'))return path;
 const clean=thaiPath(path);return english?(english==='zh'?'/zh':'/en')+(clean==='/'?'/':clean):clean;
}
