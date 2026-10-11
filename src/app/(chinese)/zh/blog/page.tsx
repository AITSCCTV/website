import {LegacyArticleRedirect} from '../../../../components/LegacyArticleRedirect';
export const metadata={title:'AITSCCTV 文章',alternates:{canonical:'https://aitscctv.com/zh/articles/'}};
export default function Blog(){return <LegacyArticleRedirect english="zh" destination={(process.env.GITHUB_PAGES==='true'?'/website':'')+'/zh/articles/'}/>}
