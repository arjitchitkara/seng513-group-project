import { prisma } from '../lib/prisma';

/**
 * Seed the database with initial data
 */
export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Create admin user (only if it doesn't exist)
    const adminEmail = 'admin@eduvault.com';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: adminEmail,
          fullName: 'Admin User',
          role: 'ADMIN',
          profile: {
            create: {
              bio: 'System administrator',
              avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff'
            }
          }
        }
      });
      console.log('✅ Admin user created');
    }

    // Create sample courses (only if they don't exist)
    const courseCount = await prisma.course.count();
    
    if (courseCount === 0) {
      await prisma.course.createMany({
        data: [
          {
            title: 'Introduction to Calculus',
            subject: 'Mathematics',
            description: 'Fundamentals of calculus including limits, derivatives, and integrals',
            rating: 4.8,
            userCount: 120,
            imageSrc: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb'
          },
          {
            title: 'Organic Chemistry',
            subject: 'Chemistry',
            description: 'Study of structure, properties, and reactions of organic compounds',
            rating: 4.5,
            userCount: 95,
            imageSrc: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69'
          },
          {
            title: 'World Literature',
            subject: 'English',
            description: 'Survey of major works of literature from different cultures and time periods',
            rating: 4.7,
            userCount: 85,
            imageSrc: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7'
          }
        ]
      });
      console.log('✅ Sample courses created');
    }

    console.log('✅ Database seeding complete');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

/**
 * Initialize the database connection
 */
export async function initDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');
    return prisma;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
}

// Run directly to seed the database
// Directly run the seed process
(async () => {
  // Only run if file is executed directly
  const isDirectExecution = process.argv[1]?.endsWith('db.ts');
  if (isDirectExecution) {
    await initDatabase();
    await seedDatabase();
    await prisma.$disconnect();
  }
})(); 