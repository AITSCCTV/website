import type {Metadata} from 'next';
import SiteLayout from '../../components/SiteLayout';
export const metadata:Metadata={metadataBase:new URL('https://aitscctv.com'),robots:{index:false,follow:false}};
export default function ThaiLayout({children}:{children:React.ReactNode}){return <SiteLayout language="th">{children}</SiteLayout>}
