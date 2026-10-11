import {siteUrl} from '../../../../lib/seo';
import {LegacyArticleRedirect} from '../../../../components/LegacyArticleRedirect';
export const metadata={title:'AITSCCTV 文章',alternates:{canonical:siteUrl('/zh/articles/')}};
export default function Blog(){return <LegacyArticleRedirect english="zh" destination={(process.env.GITHUB_PAGES==='true'?'/website':'')+'/zh/articles/'}/>}
