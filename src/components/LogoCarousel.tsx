"use client";
import {useState,type ReactNode} from 'react';
export function LogoCarousel({items}:{items:ReactNode[]}){
 const [paused,setPaused]=useState(false);
 return <div className="client-marquee" role="region" aria-label="AITSCCTV clients"><div className={'client-marquee-track'+(paused?' paused':'')}>{[0,1].map(copy=><div className="client-marquee-group" key={copy} aria-hidden={copy===1?true:undefined} inert={copy===1?true:undefined}>{items.map((item,i)=><div className="client-logo" key={i}>{item}</div>)}</div>)}</div><button className="marquee-toggle" type="button" onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?'▶':'Ⅱ'}<span className="screen-reader-text">{paused?'Resume logo animation':'Pause logo animation'}</span></button></div>
}
