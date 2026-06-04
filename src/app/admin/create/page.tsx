'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const categories = [
  { key: 'intelligence', label: '🔥情报爆料' },
  { key: 'rescue', label: '🆘救急互助' },
  { key: 'rant', label: '💬同行吐槽' },
]

export default function CreateTopicPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('intelligence')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ topicId: string } | null>(null)

  async function handleSubmit(publish = true) {
    if (!title.trim() || !description.trim()) return
    setLoading(true)
    try {
      const password = localStorage.getItem('admin_password') || ''
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          images,
          category,
          status: publish ? 'published' : 'draft',
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
      } else {
        alert(data.error || '创建失败')
      }
    } catch (error) {
      alert('创建失败')
    } finally {
      setLoading(false)
    }
  }

  function handleImageAdd() {
    if (images.length >= 3) {
      alert('最多3张图片')
      return
    }
    const url = prompt('输入图片URL：')
    if (url) {
      setImages([...images, url])
    }
  }

  if (result) {
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/topic/${result.topicId}`
    return (
      <main className="min-h-screen bg-bg p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-lg font-bold text-center mb-6">创建成功</h1>
          <div className="bg-card rounded-xl p-4 mb-4">
            <p className="text-sm text-text-secondary mb-2">分享链接：</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 bg-bg rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl)
                  alert('已复制')
                }}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold"
              >
                复制
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="flex-1 py-2.5 rounded-lg bg-card text-center text-sm font-bold"
            >
              返回列表
            </Link>
            <Link
              href={`/topic/${result.topicId}`}
              className="flex-1 py-2.5 rounded-lg bg-primary text-center text-white text-sm font-bold"
            >
              查看话题
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-text-secondary">
            ←
          </Link>
          <h1 className="text-lg font-bold">创建话题</h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary block mb-1.5">
              标题 <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              placeholder="输入话题标题"
              className="w-full bg-card rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none"
            />
            <p className="text-xs text-text-secondary mt-1 text-right">
              {title.length}/50
            </p>
          </div>

          <div>
            <label className="text-sm text-text-secondary block mb-1.5">
              描述 <span className="text-primary">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={5}
              placeholder="输入话题描述"
              className="w-full bg-card rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none resize-none"
            />
            <p className="text-xs text-text-secondary mt-1 text-right">
              {description.length}/500
            </p>
          </div>

          <div>
            <label className="text-sm text-text-secondary block mb-1.5">
              板块
            </label>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    category === cat.key
                      ? 'bg-primary text-white'
                      : 'bg-card text-text-secondary'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-text-secondary block mb-1.5">
              图片（可选，最多3张）
            </label>
            <div className="flex gap-2 flex-wrap">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img}
                    alt=""
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={() =>
                      setImages(images.filter((_, i) => i !== idx))
                    }
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <button
                  onClick={handleImageAdd}
                  className="w-20 h-20 rounded-lg bg-card flex items-center justify-center text-text-secondary text-2xl"
                >
                  +
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading || !title.trim() || !description.trim()}
              className="flex-1 py-2.5 rounded-lg bg-card text-sm font-bold text-text-secondary disabled:opacity-50"
            >
              存草稿
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading || !title.trim() || !description.trim()}
              className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-bold disabled:opacity-50"
            >
              {loading ? '发布中...' : '发布'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
