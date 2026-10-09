import {LegacyArticleRedirect} from '../../../../components/LegacyArticleRedirect';
export const metadata={title:'AITSCCTV Articles',alternates:{canonical:'https://aitscctv.com/en/articles/'}};
export default function Blog(){return <LegacyArticleRedirect english destination={(process.env.GITHUB_PAGES==='true'?'/website':'')+'/en/articles/'}/>}
