'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Comment {
  id: string
  nickname: string
  content: string
  likes: number
  createdAt: string
}

interface Topic {
  id: string
  title: string
  description: string
  images: string[]
  category: string
  views: number
  likes: number
  commentsCount: number
  shares: number
  comments: Comment[]
  createdAt: string
}

const categoryMap: Record<string, string> = {
  intelligence: '🔥情报爆料',
  rescue: '🆘救急互助',
  rant: '💬同行吐槽',
}

export default function TopicPage() {
  const params = useParams()
  const id = params.id as string

  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInput, setShowInput] = useState(false)
  const [nickname, setNickname] = useState('匿名店长')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (id) fetchTopic()
  }, [id])

  async function fetchTopic() {
    setLoading(true)
    try {
      const res = await fetch(`/api/topics/${id}`)
      const data = await res.json()
      setTopic(data.topic || null)
    } catch (error) {
      console.error('获取话题失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/topics/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, content: content.trim() }),
      })
      if (res.ok) {
        setContent('')
        setShowInput(false)
        alert('提交成功，等待审核')
      } else {
        const data = await res.json()
        alert(data.error || '提交失败')
      }
    } catch (error) {
      alert('提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLikeComment(commentId: string) {
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        setLikedComments((prev) => {
          const next = new Set(prev)
          if (data.liked) {
            next.add(commentId)
          } else {
            next.delete(commentId)
          }
          return next
        })
        // 刷新话题数据更新点赞数
        fetchTopic()
      }
    } catch (error) {
      console.error('点赞失败:', error)
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/topic/${id}`
    try {
      await navigator.clipboard.writeText(url)
      await fetch(`/api/topics/${id}/share`, { method: 'POST' })
      alert('链接已复制到剪贴板')
      // 更新本地share数
      setTopic((prev) => prev ? { ...prev, shares: prev.shares + 1 } : prev)
    } catch (error) {
      alert('复制失败')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text-secondary">加载中...</div>
      </main>
    )
  }

  if (!topic) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text-secondary">话题不存在</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg pb-24">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-10 bg-bg/95 backdrop-blur border-b border-card px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-text-secondary text-sm">
          ← 返回
        </Link>
        <span className="text-xs text-primary">
          {categoryMap[topic.category] || topic.category}
        </span>
      </header>

      {/* 话题内容 */}
      <div className="px-4 py-4">
        <h1 className="text-xl font-bold text-text-primary leading-tight">
          {topic.title}
        </h1>
        <p className="text-sm text-text-secondary mt-3 leading-relaxed">
          {topic.description}
        </p>

        {/* 图片横向滑动 */}
        {topic.images && topic.images.length > 0 && (
          <div className="image-scroll mt-4">
            {topic.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                className="w-64 h-40 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        {/* 数据栏 */}
        <div className="flex items-center justify-between mt-4 text-sm text-text-secondary">
          <div className="flex gap-4">
            <span>👁 {topic.views}</span>
            <span>❤️ {topic.likes}</span>
            <span>💬 {topic.commentsCount}</span>
            <span>↗️ {topic.shares}</span>
          </div>
        </div>

        {/* 转发按钮 */}
        <button
          onClick={handleShare}
          className="mt-3 w-full py-2.5 rounded-lg border border-primary text-primary text-sm font-medium active:bg-primary/10 transition-colors"
        >
          ↗️ 转发话题
        </button>
      </div>

      {/* 分割线 */}
      <div className="h-2 bg-bg border-t border-card" />

      {/* 评论区 */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-bold text-text-secondary mb-3">
          {topic.comments.length} 位同行参与讨论
        </h3>

        {topic.comments.length === 0 ? (
          <div className="text-center py-8 text-text-secondary text-sm">
            暂无评论，来做第一个发言的人
          </div>
        ) : (
          <div className="space-y-3">
            {topic.comments.map((comment) => (
              <div key={comment.id} className="bg-card rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">
                    {comment.nickname}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <p className="text-sm text-text-primary mt-2 leading-relaxed">
                  {comment.content}
                </p>
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className={`mt-2 text-xs flex items-center gap-1 transition-colors ${
                    likedComments.has(comment.id)
                      ? 'text-primary'
                      : 'text-text-secondary'
                  }`}
                >
                  {likedComments.has(comment.id) ? '❤️' : '🤍'} {comment.likes}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部固定栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg/95 backdrop-blur border-t border-card px-4 py-3">
        <button
          onClick={() => setShowInput(true)}
          className="w-full py-3 rounded-lg bg-primary text-white text-sm font-bold active:opacity-90 transition-opacity"
        >
          参与讨论
        </button>
      </div>

      {/* 输入框弹层 */}
      {showInput && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setShowInput(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-card rounded-t-2xl z-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold">参与讨论</h4>
              <button
                onClick={() => setShowInput(false)}
                className="text-text-secondary text-lg"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="昵称"
              maxLength={50}
              className="w-full bg-bg rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none mb-3"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下你的想法..."
              maxLength={300}
              rows={4}
              className="w-full bg-bg rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-text-secondary">
                {content.length}/300
              </span>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || submitting}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${
                  content.trim() && !submitting
                    ? 'bg-primary text-white'
                    : 'bg-card text-text-secondary'
                }`}
              >
                {submitting ? '发布中...' : '发布'}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
