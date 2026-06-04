import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// 简单密码认证中间件
function checkAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  const password = authHeader.replace('Bearer ', '')
  return password === process.env.ADMIN_PASSWORD
}

// GET /api/admin/topics - 管理后台话题列表
export async function GET(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const topics = await prisma.topic.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        views: true,
        likes: true,
        commentsCount: true,
        shares: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ topics })
  } catch (error) {
    console.error('获取管理后台话题列表失败:', error)
    return NextResponse.json(
      { error: '获取话题列表失败' },
      { status: 500 }
    )
  }
}
