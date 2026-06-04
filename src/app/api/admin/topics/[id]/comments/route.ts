import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function checkAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  const password = authHeader.replace('Bearer ', '')
  return password === process.env.ADMIN_PASSWORD
}

// GET /api/admin/topics/[id]/comments - 评论审核列表
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const { id } = params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = { topicId: id }
    if (status && ['pending', 'approved', 'deleted'].includes(status)) {
      where.status = status
    }

    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nickname: true,
        content: true,
        likes: true,
        status: true,
        ipAddress: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('获取评论列表失败:', error)
    return NextResponse.json(
      { error: '获取评论列表失败' },
      { status: 500 }
    )
  }
}
