import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClientIP } from '@/lib/ip'

export const dynamic = 'force-dynamic'

// POST /api/topics/[id]/comments - 发表评论（同IP 1小时最多3条）
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { nickname, content } = body
    const ip = getClientIP(request)

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: '评论内容不能为空' },
        { status: 400 }
      )
    }

    if (content.length > 300) {
      return NextResponse.json(
        { error: '评论不能超过300字' },
        { status: 400 }
      )
    }

    // 防刷：同IP 1小时内最多3条评论
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentComments = await prisma.comment.count({
      where: {
        ipAddress: ip,
        createdAt: { gte: oneHourAgo },
      },
    })

    if (recentComments >= 3) {
      return NextResponse.json(
        { error: '操作太频繁，请稍后再试' },
        { status: 429 }
      )
    }

    const comment = await prisma.$transaction([
      prisma.comment.create({
        data: {
          topicId: id,
          nickname: nickname || '匿名店长',
          content: content.trim(),
          ipAddress: ip,
          status: 'pending',
        },
      }),
      prisma.topic.update({
        where: { id },
        data: { commentsCount: { increment: 1 } },
      }),
    ])

    return NextResponse.json(
      { message: '提交成功，等待审核', comment: comment[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('发表评论失败:', error)
    return NextResponse.json(
      { error: '发表评论失败' },
      { status: 500 }
    )
  }
}
