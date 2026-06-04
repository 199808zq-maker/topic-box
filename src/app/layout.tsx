import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '上海餐饮情报站',
  description: '餐饮同行匿名话题讨论',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-bg text-text-primary">
        {children}
      </body>
    </html>
  )
}
