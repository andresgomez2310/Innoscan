// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Categorías — datos Flyweight
  await prisma.category.createMany({
    skipDuplicates: true,
    data: [
      { id: 'cat_electronics', label: 'Electrónica',     icon: '⚡', color: '#00f5d4' },
      { id: 'cat_furniture',   label: 'Mobiliario',      icon: '🪑', color: '#fee440' },
      { id: 'cat_clothing',    label: 'Ropa',            icon: '👕', color: '#f15bb5' },
      { id: 'cat_tools',       label: 'Herramientas',    icon: '🔧', color: '#fb5607' },
      { id: 'cat_books',       label: 'Libros',          icon: '📚', color: '#9b5de5' },
      { id: 'cat_appliances',  label: 'Electrodomésticos', icon: '🏠', color: '#00bbf9' },
    ],
  });

  // Tipos de transformación — datos Flyweight
  await prisma.transformationType.createMany({
    skipDuplicates: true,
    data: [
      { id: 'type_reuse',       name: 'Reutilizar',   strategyKey: 'reuseStrategy',       description: 'Donar, vender o intercambiar el objeto' },
      { id: 'type_transform',   name: 'Transformar',  strategyKey: 'transformStrategy',   description: 'Upcycling, desmontaje o taller DIY'     },
      { id: 'type_reconfigure', name: 'Reconfigurar', strategyKey: 'reconfigureStrategy', description: 'Reparar, adaptar o combinar el objeto'   },
    ],
  });

  console.log('✅ Seed completado — categorías y tipos de transformación cargados');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
