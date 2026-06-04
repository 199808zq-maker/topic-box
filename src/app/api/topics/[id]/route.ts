import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClientIP } from '@/lib/ip'

export const dynamic = 'force-dynamic'

// GET /api/topics/[id] - 话题详情（自动计浏览，IP去重）
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const ip = getClientIP(request)
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // 检查今天是否已记录浏览
    const existingView = await prisma.topicView.findUnique({
      where: {
        topicId_ipAddress_viewDate: {
          topicId: id,
          ipAddress: ip,
          viewDate: today,
        },
      },
    })

    // 如果今天没有浏览记录，则增加浏览量
    if (!existingView) {
      await prisma.$transaction([
        prisma.topicView.create({
          data: {
            topicId: id,
            ipAddress: ip,
            userAgent: request.headers.get('user-agent') || '',
            viewDate: today,
          },
        }),
        prisma.topic.update({
          where: { id },
          data: { views: { increment: 1 } },
        }),
      ])
    }

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        comments: {
          where: { status: 'approved' },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            nickname: true,
            content: true,
            likes: true,
            createdAt: true,
          },
        },
      },
    })

    if (!topic) {
      return NextResponse.json(
        { error: '话题不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ topic })
  } catch (error) {
    console.error('获取话题详情失败:', error)
    return NextResponse.json(
      { error: '获取话题详情失败' },
      { status: 500 }
    )
  }
}
