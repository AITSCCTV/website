import type {NextConfig} from 'next';
const config:NextConfig={
 trailingSlash:true,
 poweredByHeader:false,
 env:{NEXT_PUBLIC_SITE_BASE_PATH:process.env.GITHUB_PAGES==='true'?'/website':''},
 distDir:process.env.NODE_ENV==='development'?'.next-dev':'.next',
 ...(process.env.GITHUB_PAGES==='true'?{
  output:'export',
  basePath:'/website',
  images:{unoptimized:true},
 }:{
  async redirects(){return [{source:'/blog/',destination:'/articles/',permanent:true},{source:'/en/blog/',destination:'/en/articles/',permanent:true},{source:'/zh/blog/',destination:'/zh/articles/',permanent:true}]},
 }),
};
export default config;
