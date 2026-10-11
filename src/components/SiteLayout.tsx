import {PageStyles} from './PageStyles';
import {Header} from './Header';
import {Footer} from './Footer';
import '../app/globals.css';
import '@fontsource/kanit/400.css';
import '@fontsource/kanit/600.css';
export default function SiteLayout({children,language}:{children:React.ReactNode;language:"th"|"en"|"zh-Hans"}){return <html lang={language}><body><PageStyles id="shared"/><Header logo="/assets/d32bdcfe9b2edc06.webp"/><main id="main">{children}</main><Footer/></body></html>}
