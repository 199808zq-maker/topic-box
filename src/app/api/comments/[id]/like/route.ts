import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClientIP } from '@/lib/ip'

export const dynamic = 'force-dynamic'

// POST /api/comments/[id]/like - 点赞评论（IP防重）
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const ip = getClientIP(request)

    // 检查是否已点赞
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_ipAddress: {
          commentId: id,
          ipAddress: ip,
        },
      },
    })

    if (existingLike) {
      // 已点赞，取消点赞
      await prisma.$transaction([
        prisma.commentLike.delete({
          where: { id: existingLike.id },
        }),
        prisma.comment.update({
          where: { id },
          data: { likes: { decrement: 1 } },
        }),
      ])

      return NextResponse.json({ liked: false })
    }

    // 未点赞，添加点赞
    await prisma.$transaction([
      prisma.commentLike.create({
        data: {
          commentId: id,
          ipAddress: ip,
        },
      }),
      prisma.comment.update({
        where: { id },
        data: { likes: { increment: 1 } },
      }),
    ])

    return NextResponse.json({ liked: true })
  } catch (error) {
    console.error('点赞失败:', error)
    return NextResponse.json(
      { error: '点赞失败' },
      { status: 500 }
    )
  }
}
