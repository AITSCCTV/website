"use client";
import {useState,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {languageFor} from '../lib/locale-path';
import {uiText} from '../lib/localization-ui';
export function LogoCarousel({items}:{items:ReactNode[]}){
 const [paused,setPaused]=useState(false),language=languageFor(usePathname())==='zh'?'zh' as const:false;
 return <div className="client-marquee" role="region" aria-label={uiText("AITSCCTV clients",language)} tabIndex={0}><div className={'client-marquee-track'+(paused?' paused':'')}>{[0,1].map(copy=><div className="client-marquee-group" key={copy} aria-hidden={copy===1?true:undefined} inert={copy===1?true:undefined}>{items.map((item,i)=><div className="client-logo" key={i}>{item}</div>)}</div>)}</div><button className="marquee-toggle" type="button" onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?'▶':'Ⅱ'}<span className="screen-reader-text">{uiText(paused?'Resume logo animation':'Pause logo animation',language)}</span></button></div>
}
