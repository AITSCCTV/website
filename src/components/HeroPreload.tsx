import heroes from '../generated/hero-images.json';
import {preload} from 'react-dom';
export function HeroPreload({path}:{path:string}){
 const hero=(heroes as Record<string,{phone:string;desktop:string}>)[path];
 if(hero){
  if(hero.phone===hero.desktop)preload(hero.phone,{as:'image',fetchPriority:'high'});
  else{preload(hero.phone,{as:'image',media:'(max-width: 640px)',fetchPriority:'high'});preload(hero.desktop,{as:'image',media:'(min-width: 641px)',fetchPriority:'high'})}
 }
 return null;
}
