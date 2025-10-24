import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: '%s | 국어 학습 시스템',
    default: '국어 학습 통합 시스템'
  },
  description: "독해력 향상을 위한 국어 학습 시스템. 문단별 분석과 실시간 피드백으로 국어 실력을 키워보세요.",
  keywords: ["국어", "독해", "학습", "교육", "문법", "문학", "비문학"],
  authors: [{ name: "국어 학습 시스템" }],
  creator: "국어 학습 시스템",
  publisher: "국어 학습 시스템",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: '국어 학습 통합 시스템',
    description: '독해력 향상을 위한 국어 학습 시스템. 문단별 분석과 실시간 피드백으로 국어 실력을 키워보세요.',
    url: '/',
    siteName: '국어 학습 시스템',
    locale: 'ko_KR',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
