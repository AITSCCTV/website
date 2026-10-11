import {siteUrl} from '../../../lib/seo';
import {ArticleArchive} from '../../../components/ArticleArchive';
export const metadata={title:'บทความและผลงาน | AITSCCTV',description:'อ่านบทความและผลงาน AITSCCTV เกี่ยวกับกล้องวงจรปิด สมาร์ทโฮม ระบบเครือข่ายและระบบความปลอดภัยในประเทศไทย',alternates:{canonical:siteUrl('/articles/'),languages:{th:siteUrl('/articles/'),en:siteUrl('/en/articles/'),'zh-Hans':siteUrl('/zh/articles/')}}};
export default function Articles(){return <ArticleArchive/>}
