"use client";
import type {ContentLanguage} from '../lib/locale-path';
import {uiText} from '../lib/localization-ui';
import {useState,type CSSProperties} from 'react';
export function VideoFrame({src,style,english=false}:{src:string;style?:CSSProperties;english?:ContentLanguage}){
 const [playing,setPlaying]=useState(false);
 return <div className="video-frame" style={style}>{playing?<iframe src={src} title={english?uiText("AITSCCTV video",english):"วิดีโอ AITSCCTV"} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen/>:<button type="button" className="video-play cursor-pointer border-0 text-white" onClick={()=>setPlaying(true)} aria-label={english?uiText("Play video",english):"เล่นวิดีโอ"}><span aria-hidden="true">▶</span></button>}</div>;
}
