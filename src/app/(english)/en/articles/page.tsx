import {siteUrl} from '../../../../lib/seo';
import {ArticleArchive} from '../../../../components/ArticleArchive';
import {ArticleDirectory} from '../../../../components/ArticleDirectory';
import {PageIdentity} from '../../../../components/StructuredData';
export const metadata={title:'Articles & Project Stories | AITSCCTV',description:'Explore AITSCCTV articles and project stories on CCTV, smart homes, networking and security systems in Thailand.',alternates:{canonical:siteUrl('/en/articles/'),languages:{th:siteUrl('/articles/'),en:siteUrl('/en/articles/'),'zh-Hans':siteUrl('/zh/articles/')}}};
export default function Articles(){return <><PageIdentity path="/en/articles/" title={metadata.title} description={metadata.description} language="en" collection/><ArticleArchive english/><ArticleDirectory language="en"/></>}
