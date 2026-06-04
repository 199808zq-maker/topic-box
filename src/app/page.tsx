'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Topic {
  id: string
  title: string
  description: string
  category: string
  views: number
  likes: number
  commentsCount: number
  createdAt: string
}

const categories = [
  { key: '', label: '全部' },
  { key: 'intelligence', label: '🔥情报爆料' },
  { key: 'rescue', label: '🆘救急互助' },
  { key: 'rant', label: '💬同行吐槽' },
]

const categoryMap: Record<string, string> = {
  intelligence: '🔥情报爆料',
  rescue: '🆘救急互助',
  rant: '💬同行吐槽',
}

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [activeCategory, setActiveCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopics()
  }, [activeCategory])

  async function fetchTopics() {
    setLoading(true)
    try {
      const url = activeCategory
        ? `/api/topics?category=${activeCategory}`
        : '/api/topics'
      const res = await fetch(url)
      const data = await res.json()
      setTopics(data.topics || [])
    } catch (error) {
      console.error('获取话题失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-bg pb-6">
      {/* 头部 */}
      <header className="sticky top-0 z-10 bg-bg/95 backdrop-blur border-b border-card px-4 py-3">
        <h1 className="text-lg font-bold text-center">上海餐饮情报站</h1>
      </header>

      {/* 板块筛选 */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeCategory === cat.key
                ? 'bg-primary text-white'
                : 'bg-card text-text-secondary'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 话题列表 */}
      <div className="px-4 space-y-3">
        {loading ? (
          <div className="text-center py-10 text-text-secondary">加载中...</div>
        ) : topics.length === 0 ? (
          <div className="text-center py-10 text-text-secondary">
            暂无话题
          </div>
        ) : (
          topics.map((topic) => (
            <Link key={topic.id} href={`/topic/${topic.id}`}>
              <div className="bg-card rounded-xl p-4 mb-3 active:scale-[0.98] transition-transform">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-bold text-text-primary flex-1 line-clamp-2">
                    {topic.title}
                  </h2>
                  <span className="text-xs text-primary whitespace-nowrap">
                    {categoryMap[topic.category] || topic.category}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mt-2 line-clamp-2 leading-relaxed">
                  {topic.description}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-text-secondary">
                  <span>👁 {topic.views}</span>
                  <span>❤️ {topic.likes}</span>
                  <span>💬 {topic.commentsCount}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  )
}
