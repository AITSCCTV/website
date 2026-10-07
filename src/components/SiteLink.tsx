import Link from 'next/link';
import type {AnchorHTMLAttributes} from 'react';
export function SiteLink({href='',children,...props}:AnchorHTMLAttributes<HTMLAnchorElement>){
 if(href.startsWith('/')&&!href.startsWith('//'))return <Link href={href} {...props}>{children}</Link>;
 return <a href={href} {...props}>{children}</a>;
}
