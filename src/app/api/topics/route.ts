import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/topics - 创建话题（管理接口）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, images, category } = body

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: '标题、描述和板块为必填项' },
        { status: 400 }
      )
    }

    if (title.length > 50) {
      return NextResponse.json(
        { error: '标题不能超过50字' },
        { status: 400 }
      )
    }

    if (description.length > 500) {
      return NextResponse.json(
        { error: '描述不能超过500字' },
        { status: 400 }
      )
    }

    const topic = await prisma.topic.create({
      data: {
        title,
        description,
        images: images || [],
        category,
        status: 'published',
      },
    })

    return NextResponse.json({ topicId: topic.id }, { status: 201 })
  } catch (error) {
    console.error('创建话题失败:', error)
    return NextResponse.json(
      { error: '创建话题失败' },
      { status: 500 }
    )
  }
}

// GET /api/topics - 话题列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = { status: 'published' }
    if (category && ['intelligence', 'rescue', 'rant'].includes(category)) {
      where.category = category
    }

    const topics = await prisma.topic.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        views: true,
        likes: true,
        commentsCount: true,
        shares: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ topics })
  } catch (error) {
    console.error('获取话题列表失败:', error)
    return NextResponse.json(
      { error: '获取话题列表失败' },
      { status: 500 }
    )
  }
}
