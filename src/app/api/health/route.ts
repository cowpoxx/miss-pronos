import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    return NextResponse.json({ 
      status: 'ok', 
      authenticated: !!session,
      user: session?.user ? { id: session.user.id, name: session.user.name, email: session.user.email } : null
    })
  } catch (error) {
    return NextResponse.json({ status: 'ok', authenticated: false }, { status: 200 })
  }
}