import {SiteLink} from './SiteLink';
import thai from '../generated/articles.json';
import english from '../generated/english-editorial-index.json';
import chinese from '../generated/chinese-editorial-index.json';

// Render every article link on the server so discovery and navigation do not
// depend on the interactive archive's search or pagination JavaScript.
export function ArticleDirectory({language}:{language:'th'|'en'|'zh'}){
 const articles=language==='th'?thai:language==='en'?english:chinese;
 const label=language==='th'?'สารบัญบทความและผลงานทั้งหมด':language==='en'?'All articles and project stories':'全部文章与项目案例';
 return <details className="article-directory"><summary>{label} ({articles.length})</summary><nav aria-label={label}><ul>{articles.map(article=><li key={article.href}><SiteLink href={article.href}>{article.title}</SiteLink></li>)}</ul></nav></details>;
}
