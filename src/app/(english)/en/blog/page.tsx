import {siteUrl} from '../../../../lib/seo';
import {LegacyArticleRedirect} from '../../../../components/LegacyArticleRedirect';
export const metadata={title:'AITSCCTV Articles',alternates:{canonical:siteUrl('/en/articles/')}};
export default function Blog(){return <LegacyArticleRedirect english destination={(process.env.GITHUB_PAGES==='true'?'/website':'')+'/en/articles/'}/>}
