import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import NouveauGroupeClient from './NouveauGroupeClient'

async function getEditions() {
  return prisma.edition.findMany({
    where: { isActive: true },
    orderBy: { year: 'desc' },
    select: { id: true, year: true, title: true },
  })
}

export default async function NouveauGroupePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/connexion')

  const editions = await getEditions()
  return <NouveauGroupeClient editions={editions} />
}