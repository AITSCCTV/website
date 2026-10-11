import {siteUrl} from '../../../lib/seo';
import type {Metadata} from 'next';
import SiteLayout from '../../../components/SiteLayout';
export const metadata:Metadata={description:'Professional CCTV, smart home, network and security installation in Thailand.',metadataBase:new URL(siteUrl('')),robots:{index:true,follow:true}};
export default function EnglishLayout({children}:{children:React.ReactNode}){return <SiteLayout language="en">{children}</SiteLayout>}
