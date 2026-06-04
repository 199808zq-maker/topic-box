import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/topics/[id]/share - 转发统计
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.topic.update({
      where: { id },
      data: { shares: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('转发统计失败:', error)
    return NextResponse.json(
      { error: '转发统计失败' },
      { status: 500 }
    )
  }
}
