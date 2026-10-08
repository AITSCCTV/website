import Link from 'next/link';
import type {AnchorHTMLAttributes} from 'react';
export function SiteLink({href='',children,prefetch,...props}:AnchorHTMLAttributes<HTMLAnchorElement>&{prefetch?:boolean}){
 if(href.startsWith('/')&&!href.startsWith('//'))return <Link href={href} prefetch={prefetch} {...props}>{children}</Link>;
 return <a href={href} {...props}>{children}</a>;
}
