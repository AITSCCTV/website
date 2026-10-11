import {siteUrl} from '../../../lib/seo';
import type {Metadata} from 'next';
import SiteLayout from '../../../components/SiteLayout';
export const metadata:Metadata={description:'泰国专业视频监控、智能家居、网络及安防系统设计与安装服务。',metadataBase:new URL(siteUrl('')),robots:{index:true,follow:true}};
export default function EnglishLayout({children}:{children:React.ReactNode}){return <SiteLayout language="zh-Hans">{children}</SiteLayout>}
