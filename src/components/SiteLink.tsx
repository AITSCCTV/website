import type {AnchorHTMLAttributes} from 'react';
export function SiteLink({href='',children,prefetch,...props}:AnchorHTMLAttributes<HTMLAnchorElement>&{prefetch?:boolean}){
 href=href.replace(/^https?:\/\/(?:www\.)?aitscctv\.com\/blog\/?(?=[?#]|$)/,'/articles/').replace(/^\/blog\/?(?=[?#]|$)/,'/articles/');
 // Static pages use native navigation; interactive widgets remain hydrated.
 // Keep a single base-path rule for both SSR and client-rendered links.
 const base=process.env.NEXT_PUBLIC_SITE_BASE_PATH||'';
 if(base&&href.startsWith('/')&&!href.startsWith('//')&&href!==base&&!href.startsWith(base+'/'))href=base+href;
 return <a href={href} {...props}>{children}</a>;
}
