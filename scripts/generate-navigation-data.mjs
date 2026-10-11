import fs from 'node:fs';
const source=['src/components/Header.tsx','src/components/Footer.tsx','src/lib/navigation.ts'].map(file=>fs.readFileSync(file,'utf8')).join('\n');
const dictionary=JSON.parse(fs.readFileSync('src/lib/home-en.json','utf8'));
fs.writeFileSync('src/lib/navigation-en.json',JSON.stringify(Object.fromEntries(Object.entries(dictionary).filter(([key])=>source.includes(key))),null,2));
const articles=JSON.parse(fs.readFileSync('src/generated/english-editorial-index.json','utf8'));
fs.writeFileSync('src/generated/editorial-original-links.json',JSON.stringify(Object.fromEntries(articles.map(({href,original})=>[href,original])),null,2));
