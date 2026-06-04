'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Comment {
  id: string
  nickname: string
  content: string
  likes: number
  status: string
  ipAddress: string | null
  createdAt: string
}

interface Topic {
  id: string
  title: string
  description: string
  category: string
  views: number
  likes: number
  commentsCount: number
  shares: number
  createdAt: string
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待审核', color: 'text-yellow-500' },
  approved: { label: '已通过', color: 'text-green-500' },
  deleted: { label: '已删除', color: 'text-red-500' },
}

export default function AdminTopicDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [topic, setTopic] = useState<Topic | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchTopic()
      fetchComments()
    }
  }, [id])

  async function fetchTopic() {
    try {
      const res = await fetch(`/api/topics/${id}`)
      const data = await res.json()
      setTopic(data.topic || null)
    } catch (error) {
      console.error('获取话题失败:', error)
    }
  }

  async function fetchComments() {
    try {
      const password = localStorage.getItem('admin_password') || ''
      const url = filterStatus
        ? `/api/admin/topics/${id}/comments?status=${filterStatus}`
        : `/api/admin/topics/${id}/comments`
      const res = await fetch(url, {
        headers: { authorization: `Bearer ${password}` },
      })
      const data = await res.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error('获取评论失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchComments()
  }, [filterStatus])

  async function handleUpdateComment(commentId: string, status: string) {
    try {
      const password = localStorage.getItem('admin_password') || ''
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        fetchComments()
        fetchTopic()
      } else {
        alert('操作失败')
      }
    } catch (error) {
      alert('操作失败')
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
    <main className="min-h-screen bg-bg p-4">
      <div className="max-w-4xl mx-auto">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-text-secondary">
            ← 返回
          </Link>
          <h1 className="text-lg font-bold truncate">{topic.title}</h1>
        </div>

        {/* 数据看板 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: '浏览量', value: topic.views },
            { label: '点赞数', value: topic.likes },
            { label: '评论数', value: topic.commentsCount },
            { label: '转发数', value: topic.shares },
          ].map((item) => (
            <div key={item.label} className="bg-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary">{item.value}</div>
              <div className="text-xs text-text-secondary mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        {/* 评论筛选 */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold">评论管理</h2>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-card rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none"
          >
            <option value="">全部</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="deleted">已删除</option>
          </select>
        </div>

        {/* 评论列表 */}
        <div className="bg-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg text-text-secondary text-left">
                  <th className="px-4 py-3 font-medium">昵称</th>
                  <th className="px-4 py-3 font-medium">内容</th>
                  <th className="px-4 py-3 font-medium">时间</th>
                  <th className="px-4 py-3 font-medium">状态</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {comments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-text-secondary"
                    >
                      暂无评论
                    </td>
                  </tr>
                ) : (
                  comments.map((comment) => (
                    <tr
                      key={comment.id}
                      className="border-b border-bg last:border-0 hover:bg-bg/50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-primary">
                        {comment.nickname}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="truncate" title={comment.content}>
                          {comment.content}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-text-secondary text-xs">
                        {new Date(comment.createdAt).toLocaleString('zh-CN')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={
                            statusMap[comment.status]?.color || 'text-text-secondary'
                          }
                        >
                          {statusMap[comment.status]?.label || comment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          {comment.status === 'pending' && (
                            <button
                              onClick={() =>
                                handleUpdateComment(comment.id, 'approved')
                              }
                              className="text-green-500 text-xs"
                            >
                              通过
                            </button>
                          )}
                          {comment.status !== 'deleted' && (
                            <button
                              onClick={() =>
                                handleUpdateComment(comment.id, 'deleted')
                              }
                              className="text-red-500 text-xs"
                            >
                              删除
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
