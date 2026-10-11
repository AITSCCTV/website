import {siteUrl} from '../../../lib/seo';
import {HeroPreload} from '../../../components/HeroPreload';
import HomeEnglish from '../../../generated/HomeEnglish';
export const metadata={title:'AITSCCTV | Smart Home, CCTV & IT Solutions',description:'Professional CCTV, smart home, network and security installation in Thailand.',alternates:{canonical:siteUrl('/en/'),languages:{th:siteUrl('/'),en:siteUrl('/en/'),'zh-Hans':siteUrl('/zh/')}}};
export default function English(){return <><HeroPreload path="/"/><link rel="stylesheet" href="/pages/1751.css"/><HomeEnglish/></>}
