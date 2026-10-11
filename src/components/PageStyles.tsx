import fs from 'node:fs';
import path from 'node:path';
import {cache} from 'react';

const readStyles=cache((id:string)=>{
 if(!/^(shared|\d+)$/.test(id))throw new Error('Invalid page stylesheet');
 return fs.readFileSync(path.join(process.cwd(),'public','pages',id+'.css'),'utf8');
});
// Captured styles are small when compressed. Deliver them with the static HTML
// so first paint does not wait for two extra network round trips.
export function PageStyles({id}:{id:string}){
 return <style data-page-styles={id} dangerouslySetInnerHTML={{__html:readStyles(id)}}/>;
}
