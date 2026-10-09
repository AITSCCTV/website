import {LegacyArticleRedirect} from '../../components/LegacyArticleRedirect';
export const metadata={title:'บทความของ AITSCCTV',alternates:{canonical:'https://aitscctv.com/articles/'}};
export default function Blog(){return <LegacyArticleRedirect destination={(process.env.GITHUB_PAGES==='true'?'/website':'')+'/articles/'}/>}
