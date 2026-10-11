import {PageStyles} from '../../../components/PageStyles';
import {siteUrl} from '../../../lib/seo';
import {HeroPreload} from '../../../components/HeroPreload';
import HomeChinese from '../../../generated/HomeChinese';
export const metadata={title:'AITSCCTV | 智能家居、视频监控与 IT 解决方案',description:'泰国专业视频监控、智能家居、网络及安防系统设计与安装服务。',alternates:{canonical:siteUrl('/zh/'),languages:{th:siteUrl('/'),en:siteUrl('/en/'),'zh-Hans':siteUrl('/zh/')}}};
export default function Chinese(){return <><HeroPreload path="/"/><PageStyles id="1751"/><HomeChinese/></>}
