import {siteUrl} from '../../../lib/seo';
import {LegacyArticleRedirect} from '../../../components/LegacyArticleRedirect';
export const metadata={title:'บทความของ AITSCCTV',alternates:{canonical:siteUrl('/articles/')}};
export default function Blog(){return <LegacyArticleRedirect destination={(process.env.GITHUB_PAGES==='true'?'/website':'')+'/articles/'}/>}
