"use client";
import {useState,type CSSProperties} from 'react';
export function VideoFrame({src,style,english=false}:{src:string;style?:CSSProperties;english?:boolean}){
 const [playing,setPlaying]=useState(false);
 return <div className="video-frame" style={style}>{playing?<iframe src={src} title={english?"AITSCCTV video":"วิดีโอ AITSCCTV"} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen/>:<button type="button" className="video-play cursor-pointer border-0 text-white" onClick={()=>setPlaying(true)} aria-label={english?"Play video":"เล่นวิดีโอ"}><span aria-hidden="true">▶</span></button>}</div>;
}
