import {siteUrl} from '../../lib/seo';
import type {Metadata} from 'next';
import SiteLayout from '../../components/SiteLayout';
export const metadata:Metadata={description:'บริการออกแบบและติดตั้งกล้องวงจรปิด สมาร์ทโฮม ระบบเครือข่ายและความปลอดภัยในประเทศไทย',icons:{icon:{url:siteUrl('/assets/d32bdcfe9b2edc06-responsive-320.webp'),type:'image/webp'}},metadataBase:new URL(siteUrl('')),robots:{index:true,follow:true}};
export default function ThaiLayout({children}:{children:React.ReactNode}){return <SiteLayout language="th">{children}</SiteLayout>}
