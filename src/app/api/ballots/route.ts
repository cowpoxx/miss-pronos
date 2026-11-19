import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ballotSchema } from '@/lib/ballot-validation'
import { normalizePlayerName } from '@/lib/ballot'

export const runtime = 'nodejs'

// Simple in-memory rate limiter (IP-based)
// For production with multiple instances, use Redis
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10 // max 10 votes per minute per IP
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const record = rateLimitStore.get(ip)
  
  if (!record || now >= record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true }
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) }
  }
  
  record.count++
  return { allowed: true }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown'
  
  const rateLimit = checkRateLimit(ip)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Trop de requêtes. Réessayez dans ${rateLimit.retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    )
  }
  
  try {
    const json = await request.json()
    const body = ballotSchema.parse(json)
    
    const edition = await prisma.edition.findFirst({
      where: { isActive: true },
      orderBy: { year: 'desc' }
    })
    
    if (!edition) return NextResponse.json({ error: 'Aucune édition active' }, { status: 404 })
    if (new Date() >= edition.startDate) return NextResponse.json({ error: 'Votes clos' }, { status: 403 })
    
    const normalizedName = normalizePlayerName(body.name)
    
    const ballot = await prisma.ballot.upsert({
      where: {
        editionId_normalizedName: {
          editionId: edition.id,
          normalizedName
        }
      },
      create: {
        editionId: edition.id,
        name: body.name,
        normalizedName,
        top12: body.top12,
        top5: body.top5
      },
      update: {
        name: body.name,
        top12: body.top12,
        top5: body.top5
      }
    })
    
    return NextResponse.json(ballot)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 400 })
  }
}
