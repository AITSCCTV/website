import chinese from './ui-zh.json';
import type {ContentLanguage} from './locale-path';
export function uiText(text:string,language:ContentLanguage){return language==='zh'?((chinese as Record<string,string>)[text.trim()]||text):text}
