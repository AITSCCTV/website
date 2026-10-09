"use client";

import {useState} from 'react';
import videos from '../generated/videos.json';

export function VideoLibrary(){
 const [visible,setVisible]=useState(12);
 const [active,setActive]=useState<string|null>(null);
 return <section className="video-library" aria-labelledby="video-heading">
  <header className="video-library-header">
   <div><h1 id="video-heading">วิดีโอ AITSCCTV</h1><p>เรื่องน่ารู้ เทคโนโลยี และผลงานจากทีม AITS</p></div>
   <a href="https://www.youtube.com/@aitscctv9107" target="_blank" rel="noopener noreferrer">ดูทั้งหมดบน YouTube <span aria-hidden="true">↗</span></a>
  </header>
  <div className="video-library-grid">
   {videos.slice(0,visible).map(video=><article className="video-card" key={video.id}>
    <div className="video-frame video-card-media">
     {active===video.id?<iframe src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1`} title={video.title} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen/>:<button className="video-card-play" type="button" aria-label="เล่นวิดีโอ" aria-describedby={`video-${video.id}`} onClick={()=>setActive(video.id)}>
      <img src={video.image} srcSet={video.srcSet} sizes={video.sizes} width={video.width} height={video.height} alt="" loading="lazy" decoding="async"/>
      <span className="video-card-play-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg></span>
     </button>}
    </div>
    <h2 id={`video-${video.id}`}>{video.title}</h2>
    <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" aria-label={`ดูบน YouTube: ${video.title}`}>ดูบน YouTube <span aria-hidden="true">↗</span></a>
   </article>)}
  </div>
  {visible<videos.length&&<div className="video-library-more"><button type="button" onClick={()=>setVisible(videos.length)}>ดูวิดีโอเพิ่มเติม ({videos.length-visible})</button></div>}
 </section>;
}
