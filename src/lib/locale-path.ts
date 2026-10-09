export function thaiPath(path:string){return path.replace(/^\/website(?=\/|$)/,'').replace(/^\/en(?=\/|$)/,'')||'/'}
export function localePath(path:string,english:boolean){
 if(!path.startsWith('/')||path.startsWith('//'))return path;
 const clean=thaiPath(path);return english?'/en'+(clean==='/'?'/':clean):clean;
}
