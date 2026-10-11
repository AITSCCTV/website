import {siteUrl} from '../../../../lib/seo';
import {ArticleArchive} from '../../../../components/ArticleArchive';
export const metadata={title:'文章与项目案例 | AITSCCTV',description:'阅读 AITSCCTV 关于视频监控、智能家居、网络及安防系统的文章与泰国项目案例。',alternates:{canonical:siteUrl('/zh/articles/'),languages:{th:siteUrl('/articles/'),en:siteUrl('/en/articles/'),'zh-Hans':siteUrl('/zh/articles/')}}};
export default function Articles(){return <ArticleArchive english="zh"/>}
