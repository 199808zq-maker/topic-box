import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function checkAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  const password = authHeader.replace('Bearer ', '')
  return password === process.env.ADMIN_PASSWORD
}

// PATCH /api/admin/comments/[id] - 审核评论
export async function PATCH(
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
    const body = await request.json()
    const { status } = body

    if (!status || !['approved', 'deleted'].includes(status)) {
      return NextResponse.json(
        { error: '状态参数无效' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('审核评论失败:', error)
    return NextResponse.json(
      { error: '审核评论失败' },
      { status: 500 }
    )
  }
}
