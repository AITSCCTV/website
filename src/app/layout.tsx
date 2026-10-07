import type {Metadata} from 'next';
import {Header} from '../components/Header';
import {Footer} from '../components/Footer';
import './globals.css';
import '@fontsource/kanit/300.css';
import '@fontsource/kanit/400.css';
import '@fontsource/kanit/500.css';
import '@fontsource/kanit/600.css';
import '@fontsource/kanit/700.css';
export const metadata:Metadata={metadataBase:new URL('https://aitscctv.com'),robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="th"><body><Header logo="/assets/d32bdcfe9b2edc06.webp"/><main id="main">{children}</main><Footer/></body></html>}
