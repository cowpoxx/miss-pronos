import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Données de candidates 2025 réutilisées provisoirement pour l'édition 2027.
  // Date provisoire pour l'édition simulée; à confirmer avant la mise en production.
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
    { number: 1, name: 'Angélique Angarni-Filopon', region: 'Martinique' },
    { number: 2, name: 'Mélissa Atta Bessiom', region: 'Guyane' },
    { number: 3, name: 'Mélanie Billard', region: 'Côte d\'Azur' },
    { number: 4, name: 'Mathilde Brosset', region: 'Île-de-France' },
    { number: 5, name: 'Coralie Coquillard', region: 'Franche-Comté' },
    { number: 6, name: 'Lucie Cotta', region: 'Midi-Pyrénées' },
    { number: 7, name: 'Emma Da Silva', region: 'Rhône-Alpes' },
    { number: 8, name: 'Maëva Debaud', region: 'Limousin' },
    { number: 9, name: 'Lison Di Martino', region: 'Alsace' },
    { number: 10, name: 'Marie Djouhri', region: 'Nord-Pas-de-Calais' },
    { number: 11, name: 'Chloé Espina', region: 'Aquitaine' },
    { number: 12, name: 'Lola Fauvel', region: 'Bretagne' },
    { number: 13, name: 'Justine Godefroy', region: 'Normandie' },
    { number: 14, name: 'Emma Grousset', region: 'Poitou-Charentes' },
    { number: 15, name: 'Anaïs Hage', region: 'Centre-Val de Loire' },
    { number: 16, name: 'Eva Labouret', region: 'Languedoc-Roussillon' },
    { number: 17, name: 'Marine Le Bihan', region: 'Pays de la Loire' },
    { number: 18, name: 'Solène Leluc', region: 'Bourgogne' },
    { number: 19, name: 'Pauline Llorca', region: 'Provence' },
    { number: 20, name: 'Ambre Luberriaga', region: 'Roussillon' },
    { number: 21, name: 'Louise Marie', region: 'Réunion' },
    { number: 22, name: 'Océane Menagé', region: 'Lorraine' },
    { number: 23, name: 'Tiffany Merle', region: 'Champagne-Ardenne' },
    { number: 24, name: 'Maëva Metayer', region: 'Orléanais' },
    { number: 25, name: 'Juliette Miteau', region: 'Auvergne' },
    { number: 26, name: 'Oriane Moulin', region: 'Franche-Comté' },
    { number: 27, name: 'Méline Néry', region: 'Guadeloupe' },
    { number: 28, name: 'Alexia Peltier', region: 'Tahiti' },
    { number: 29, name: 'Audrey Raulin', region: 'Picardie' },
    { number: 30, name: 'Cindy Vigneron', region: 'Dauphiné' },
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