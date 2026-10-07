import type {NextConfig} from 'next';
const config:NextConfig={
 trailingSlash:true,
 poweredByHeader:false,
 distDir:process.env.NODE_ENV==='development'?'.next-dev':'.next',
 ...(process.env.GITHUB_PAGES==='true'?{
  output:'export',
  basePath:'/website',
  images:{unoptimized:true},
 }:{}),
};
export default config;
