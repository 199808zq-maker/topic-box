import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
        <p className="text-text-secondary mb-6">页面不存在</p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-bold"
        >
          返回首页
        </Link>
      </div>
    </main>
  )
}
