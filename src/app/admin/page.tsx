'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Topic {
  id: string
  title: string
  category: string
  status: string
  views: number
  likes: number
  commentsCount: number
  shares: number
  createdAt: string
}

const categoryMap: Record<string, string> = {
  intelligence: '🔥情报爆料',
  rescue: '🆘救急互助',
  rant: '💬同行吐槽',
}

export default function AdminPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('admin_password')
    if (saved) {
      setPassword(saved)
      checkAuth(saved)
    }
  }, [])

  async function checkAuth(pwd: string) {
    try {
      const res = await fetch('/api/admin/topics', {
        headers: { authorization: `Bearer ${pwd}` },
      })
      if (res.status === 401) {
        setError('密码错误')
        setAuthed(false)
        return
      }
      const data = await res.json()
      setTopics(data.topics || [])
      setAuthed(true)
      localStorage.setItem('admin_password', pwd)
    } catch (err) {
      setError('验证失败')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    await checkAuth(password)
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除这个话题？')) return
    // 简化处理：实际项目中添加 DELETE API
    alert('删除功能需补充 DELETE /api/topics/[id] 接口')
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-card rounded-xl p-6"
        >
          <h1 className="text-lg font-bold text-center mb-6">管理后台登录</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="输入管理密码"
            className="w-full bg-bg rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none mb-4"
          />
          {error && (
            <p className="text-primary text-xs mb-3 text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-bold"
          >
            {loading ? '验证中...' : '进入'}
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold">管理后台</h1>
          <Link
            href="/admin/create"
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold"
          >
            + 创建话题
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-text-secondary">加载中...</div>
        ) : (
          <div className="bg-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bg text-text-secondary text-left">
                    <th className="px-4 py-3 font-medium">标题</th>
                    <th className="px-4 py-3 font-medium">板块</th>
                    <th className="px-4 py-3 font-medium text-right">浏览</th>
                    <th className="px-4 py-3 font-medium text-right">点赞</th>
                    <th className="px-4 py-3 font-medium text-right">评论</th>
                    <th className="px-4 py-3 font-medium text-right">转发</th>
                    <th className="px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {topics.map((topic) => (
                    <tr
                      key={topic.id}
                      className="border-b border-bg last:border-0 hover:bg-bg/50 transition-colors"
                    >
                      <td className="px-4 py-3 max-w-xs truncate">
                        {topic.title}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {categoryMap[topic.category]}
                      </td>
                      <td className="px-4 py-3 text-right">{topic.views}</td>
                      <td className="px-4 py-3 text-right">{topic.likes}</td>
                      <td className="px-4 py-3 text-right">
                        {topic.commentsCount}
                      </td>
                      <td className="px-4 py-3 text-right">{topic.shares}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/topic/${topic.id}`}
                            className="text-primary text-xs"
                          >
                            详情
                          </Link>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/topic/${topic.id}`
                              )
                              alert('链接已复制')
                            }}
                            className="text-text-secondary text-xs"
                          >
                            复制链接
                          </button>
                          <button
                            onClick={() => handleDelete(topic.id)}
                            className="text-red-500 text-xs"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
