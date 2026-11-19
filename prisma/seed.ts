import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Candidates officielles Miss France 2027 (source: Wikipedia, élection 12 déc 2026)
  await prisma.edition.updateMany({
    where: { year: 2025 },
    data: { isActive: false },
  })

  const edition2027 = await prisma.edition.upsert({
    where: { year: 2027 },
    update: {
      title: 'Miss France 2027',
      startDate: new Date('2026-12-12T20:00:00.000Z'),
      isActive: true,
    },
    create: {
      year: 2027,
      title: 'Miss France 2027',
      startDate: new Date('2026-12-12T20:00:00.000Z'),
      isActive: true,
    },
  })

  console.log(`✅ Édition créée: ${edition2027.title}`)

  const candidates2027 = [
    { number: 1, name: 'Chiara Blazevic', region: 'Alsace' },
    { number: 2, name: 'Solène Videau', region: 'Aquitaine' },
    { number: 3, name: 'Lina Berthelier', region: 'Auvergne' },
    { number: 4, name: 'Ilona Perrot', region: 'Bourgogne' },
    { number: 5, name: 'Margot Ferré-Bernard', region: 'Bretagne' },
    { number: 6, name: 'Justine Bourrelier', region: 'Centre-Val de Loire' },
    { number: 7, name: 'Céline Leduc', region: 'Champagne-Ardenne' },
    { number: 8, name: 'Satine Nomary', region: 'Corse' },
    { number: 9, name: 'Camilla Alash', region: 'Côte d\'Azur' },
    { number: 10, name: 'Marine Leberquier', region: 'Franche-Comté' },
    { number: 11, name: 'Maureen-Alycia Lucéa-Merlin', region: 'Guadeloupe' },
    { number: 12, name: 'Aïda Brou', region: 'Guyane' },
    { number: 13, name: 'Alycia Bacha', region: 'Île-de-France' },
    { number: 14, name: 'Myriam Stocco', region: 'Languedoc' },
    { number: 15, name: 'Élise Escuriol', region: 'Limousin' },
    { number: 16, name: 'Léane Froment', region: 'Lorraine' },
    { number: 17, name: 'Clara Mévélec', region: 'Martinique' },
    { number: 18, name: 'Zakia Hamidi', region: 'Mayotte' },
    { number: 19, name: 'Carla Rachail', region: 'Midi-Pyrénées' },
    { number: 20, name: 'Shana Mendes', region: 'Nord-Pas-de-Calais' },
    { number: 21, name: 'Pauline Gourlez', region: 'Normandie' },
    { number: 22, name: 'Élise Aulnette', region: 'Nouvelle-Calédonie' },
    { number: 23, name: 'Maëlle Hamon', region: 'Pays de la Loire' },
    { number: 24, name: 'Lou-Anne Lorphelin', region: 'Picardie' },
    { number: 25, name: 'Mandy Goudal', region: 'Poitou-Charentes' },
    { number: 26, name: 'Ophélie Vitalbo', region: 'Provence' },
    { number: 27, name: 'Anisah Nassim', region: 'Réunion' },
    { number: 28, name: 'Julia Grid-Constantino', region: 'Rhône-Alpes' },
    { number: 29, name: 'Juliette Gauthier', region: 'Roussillon' },
    { number: 30, name: 'Anais Vadeleux', region: 'Saint-Martin et Saint-Barthélemy' },
    { number: 31, name: 'Leia Diard', region: 'Tahiti' },
  ]

  for (const candidate of candidates2027) {
    await prisma.candidate.upsert({
      where: { editionId_number: { editionId: edition2027.id, number: candidate.number } },
      update: {},
      create: {
        editionId: edition2027.id,
        number: candidate.number,
        name: candidate.name,
        region: candidate.region,
        sortOrder: candidate.number,
      },
    })
  }

  console.log(`✅ ${candidates2027.length} candidates créées pour Miss France 2027`)

  // Créer aussi l'édition 2024 pour historique
  const edition2024 = await prisma.edition.upsert({
    where: { year: 2024 },
    update: {},
    create: {
      year: 2024,
      title: 'Miss France 2024',
      startDate: new Date('2023-12-16T20:50:00.000Z'),
      isActive: false,
      resultsLockedAt: new Date('2023-12-16T22:00:00.000Z'),
    },
  })

  const candidates2024 = [
    { number: 1, name: 'Eve Gilles', region: 'Nord-Pas-de-Calais' },
    { number: 2, name: 'Adeline Vayssade', region: 'Aquitaine' },
    { number: 3, name: 'Mélanie Odules', region: 'Alsace' },
    { number: 4, name: 'Noémie Leca', region: 'Aquitaine' },
    { number: 5, name: 'Alicia Aylies', region: 'Guyane' },
    { number: 6, name: 'Wissem Morel', region: 'Alsace' },
    { number: 7, name: 'Amandine Petit', region: 'Normandie' },
    { number: 8, name: 'Clémence Botino', region: 'Guadeloupe' },
    { number: 9, name: 'Maëva Coucke', region: 'Nord-Pas-de-Calais' },
    { number: 10, name: 'Vaimalama Chaves', region: 'Tahiti' },
    { number: 11, name: 'Sophie Thalmann', region: 'Lorraine' },
    { number: 12, name: 'Sonia Rolland', region: 'Bourgogne' },
    { number: 13, name: 'Laury Thilleman', region: 'Bretagne' },
    { number: 14, name: 'Malika Ménard', region: 'Basse-Normandie' },
    { number: 15, name: 'Chloé Mortaud', region: 'Aquitaine' },
    { number: 16, name: 'Valérie Bègue', region: 'Réunion' },
    { number: 17, name: 'Rachel Legrain-Trapani', region: 'Picardie' },
    { number: 18, name: 'Alexandra Rosenfeld', region: 'Languedoc-Roussillon' },
    { number: 19, name: 'Cindy Fabre', region: 'Bretagne' },
    { number: 20, name: 'Laetitia Bléger', region: 'Alsace' },
    { number: 21, name: 'Lætitia Milot', region: 'Provence' },
    { number: 22, name: 'Sylvie Tellier', region: 'Lyonnais' },
    { number: 23, name: 'Christelle Lefranc', region: 'Poitou-Charentes' },
    { number: 24, name: 'Elodie Gossuin', region: 'Picardie' },
    { number: 25, name: 'Sonia Rolland', region: 'Bourgogne' },
    { number: 26, name: 'Corinne Coman', region: 'Guadeloupe' },
    { number: 27, name: 'Mareva Galanter', region: 'Tahiti' },
    { number: 28, name: 'Sabrina Nahon', region: 'Provence' },
    { number: 29, name: 'Linda Hardy', region: 'Pays de la Loire' },
    { number: 30, name: 'Mareva Georges', region: 'Tahiti' },
  ]

  for (const candidate of candidates2024) {
    await prisma.candidate.upsert({
      where: { editionId_number: { editionId: edition2024.id, number: candidate.number } },
      update: {},
      create: {
        editionId: edition2024.id,
        number: candidate.number,
        name: candidate.name,
        region: candidate.region,
        sortOrder: candidate.number,
      },
    })
  }

  console.log(`✅ ${candidates2024.length} candidates créées pour Miss France 2024`)

  console.log('🎉 Seed terminé avec succès !')
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })