import 'dotenv/config';
import { prisma } from '../lib/prisma';

/**
 * Seed the database with initial data
 */
export async function seedDatabase(forceReset = false) {
  try {
    console.log('🌱 Seeding database...');

    // Check if we need to force reset
    if (forceReset) {
      console.log('🔄 Force reset enabled, deleting related records first...');
      
      // First delete documents that reference courses
      console.log('Deleting related documents...');
      await prisma.document.deleteMany({});
      
      // Then delete the courses
      console.log('Deleting existing courses...');
      await prisma.course.deleteMany({});
      
      console.log('✅ Existing data deleted');
    }

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
    console.log(`Found ${courseCount} existing courses`);
    
    if (courseCount === 0 || forceReset) {
      console.log('💾 Creating sample courses...');
      await prisma.course.createMany({
        data: [
          { title: 'Academic Writing ACWR', subject: 'Arts', description: 'Course on academic writing skills', rating: 4.5, userCount: 80, imageSrc: 'https://images.unsplash.com/photo-1455390582262-044cdead277a' },
          { title: 'Accounting ACCT', subject: 'Business', description: 'Principles of accounting', rating: 4.3, userCount: 110, imageSrc: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f' },
          { title: 'Actuarial Science ACSC', subject: 'Mathematics', description: 'Application of mathematics to assess risk', rating: 4.6, userCount: 65, imageSrc: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71' },
          { title: 'Aerospace Engineering ENAE', subject: 'Engineering', description: 'Design and construction of aircraft and spacecraft', rating: 4.7, userCount: 70, imageSrc: 'https://images.unsplash.com/photo-1518364538800-6bae3c2ea0f2' },
          { title: 'African Studies AFST', subject: 'Social Sciences', description: 'Study of African cultures and history', rating: 4.4, userCount: 55, imageSrc: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43' },
          { title: 'American Sign Language ASL', subject: 'Languages', description: 'Visual language used by the deaf community', rating: 4.5, userCount: 60, imageSrc: 'https://images.unsplash.com/photo-1508780709619-79562169bc64' },
          { title: 'Anthropology ANTH', subject: 'Social Sciences', description: 'Study of human societies and cultures', rating: 4.6, userCount: 75, imageSrc: 'https://images.unsplash.com/photo-1581425131536-1f63765be463' },
          { title: 'Arabic Language and Muslim Cultures ALMC', subject: 'Languages', description: 'Arabic language and cultural studies', rating: 4.5, userCount: 45, imageSrc: 'https://images.unsplash.com/photo-1507041957456-9c397ce39c97' },
          { title: 'Archaeology ARKY', subject: 'Social Sciences', description: 'Study of human history through excavation', rating: 4.7, userCount: 65, imageSrc: 'https://images.unsplash.com/photo-1564164841584-391b5139bba6' },
          { title: 'Architectural Studies ARST', subject: 'Architecture', description: 'Study of building design principles', rating: 4.6, userCount: 70, imageSrc: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625' },
          { title: 'Architecture ARCH', subject: 'Architecture', description: 'Design and construction of buildings', rating: 4.8, userCount: 85, imageSrc: 'https://images.unsplash.com/photo-1470723710355-95304d8aece4' },
          { title: 'Architecture, Planning and Landscape APLA', subject: 'Architecture', description: 'Integrated approach to built environment', rating: 4.7, userCount: 75, imageSrc: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09' },
          { title: 'Art ART', subject: 'Arts', description: 'Visual arts creation and theory', rating: 4.5, userCount: 90, imageSrc: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968' },
          { title: 'Art History ARHI', subject: 'Arts', description: 'Historical study of visual arts', rating: 4.6, userCount: 60, imageSrc: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04' },
          { title: 'Arts ARTS', subject: 'Arts', description: 'General arts studies', rating: 4.4, userCount: 85, imageSrc: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b' },
          { title: 'Arts and Science Honours Academy ASHA', subject: 'Interdisciplinary', description: 'Interdisciplinary honors program', rating: 4.9, userCount: 40, imageSrc: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b' },
          { title: 'Astronomy ASTR', subject: 'Sciences', description: 'Study of celestial objects', rating: 4.8, userCount: 75, imageSrc: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564' },
          { title: 'Astrophysics ASPH', subject: 'Sciences', description: 'Physics of astronomical objects', rating: 4.8, userCount: 60, imageSrc: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7' },
          { title: 'Biochemistry BCEM', subject: 'Sciences', description: 'Chemical processes within living organisms', rating: 4.7, userCount: 85, imageSrc: 'https://images.unsplash.com/photo-1576086213369-97a306d36557' },
          { title: 'Biology BIOL', subject: 'Sciences', description: 'Study of living organisms', rating: 4.6, userCount: 110, imageSrc: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8' },
          { title: 'Biomedical Engineering BMEN', subject: 'Engineering', description: 'Engineering principles applied to medicine', rating: 4.8, userCount: 80, imageSrc: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28' },
          { title: 'Biostatistics BIST', subject: 'Mathematics', description: 'Statistical methods in biology', rating: 4.6, userCount: 55, imageSrc: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40' },
          { title: 'Botany BOTA', subject: 'Sciences', description: 'Scientific study of plants', rating: 4.5, userCount: 50, imageSrc: 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb' },
          { title: 'Business and Environment BSEN', subject: 'Business', description: 'Environmental aspects of business', rating: 4.5, userCount: 75, imageSrc: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf' },
          { title: 'Business Technology Management BTMA', subject: 'Business', description: 'IT applications in business', rating: 4.6, userCount: 90, imageSrc: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f' },
          { title: 'Canadian Studies CNST', subject: 'Social Sciences', description: 'Study of Canadian culture and society', rating: 4.4, userCount: 55, imageSrc: 'https://images.unsplash.com/photo-1508693926297-1d61ee3df82a' },
          { title: 'Cellular, Molecular and Microbial Biology CMMB', subject: 'Sciences', description: 'Biology at cellular and molecular level', rating: 4.7, userCount: 70, imageSrc: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69' },
          { title: 'Central and East European Studies CEST', subject: 'Social Sciences', description: 'Study of Central and Eastern European societies', rating: 4.5, userCount: 45, imageSrc: 'https://images.unsplash.com/photo-1541343672885-9be56236302a' },
          { title: 'Chemical Engineering ENCH', subject: 'Engineering', description: 'Design and operation of chemical processes', rating: 4.7, userCount: 85, imageSrc: 'https://images.unsplash.com/photo-1596496356940-8b5239adc721' },
          { title: 'Chemistry CHEM', subject: 'Sciences', description: 'Study of matter and its properties', rating: 4.6, userCount: 95, imageSrc: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6' },
          { title: 'Chinese CHIN', subject: 'Languages', description: 'Chinese language and culture', rating: 4.5, userCount: 60, imageSrc: 'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4' },
          { title: 'Civil Engineering ENCI', subject: 'Engineering', description: 'Design and construction of infrastructure', rating: 4.7, userCount: 90, imageSrc: 'https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea' },
          { title: 'Computer Science CPSC', subject: 'Sciences', description: 'Study of computation and programming', rating: 4.8, userCount: 150, imageSrc: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c' },
          { title: 'Data Science DATA', subject: 'Sciences', description: 'Analysis and interpretation of data', rating: 4.9, userCount: 120, imageSrc: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71' },
          { title: 'Economics ECON', subject: 'Social Sciences', description: 'Study of production, distribution, and consumption', rating: 4.6, userCount: 110, imageSrc: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3' },
          { title: 'Electrical Engineering ENEL', subject: 'Engineering', description: 'Study of electrical systems', rating: 4.7, userCount: 95, imageSrc: 'https://images.unsplash.com/photo-1605457867610-e990b283a327' },
          { title: 'Engineering ENGG', subject: 'Engineering', description: 'General engineering principles', rating: 4.7, userCount: 130, imageSrc: 'https://images.unsplash.com/photo-1581093458791-9d2f451ca254' },
          { title: 'English ENGL', subject: 'Arts', description: 'English literature and writing', rating: 4.5, userCount: 105, imageSrc: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7' },
          { title: 'Finance FNCE', subject: 'Business', description: 'Management of money and assets', rating: 4.7, userCount: 105, imageSrc: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40' },
          { title: 'Geography GEOG', subject: 'Social Sciences', description: 'Study of places and environments', rating: 4.5, userCount: 75, imageSrc: 'https://images.unsplash.com/photo-1524661135-423995f22d0b' },
          { title: 'Geology GLGY', subject: 'Sciences', description: 'Study of the Earth\'s structure', rating: 4.6, userCount: 65, imageSrc: 'https://images.unsplash.com/photo-1536217568470-5b63f13b9858' },
          { title: 'History HTST', subject: 'Arts', description: 'Study of past events', rating: 4.6, userCount: 85, imageSrc: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1' },
          { title: 'Kinesiology KNES', subject: 'Health Sciences', description: 'Study of human movement', rating: 4.7, userCount: 95, imageSrc: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd' },
          { title: 'Law LAW', subject: 'Law', description: 'Study of legal systems and regulations', rating: 4.8, userCount: 90, imageSrc: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9' },
          { title: 'Mathematics MATH', subject: 'Sciences', description: 'Study of numbers, quantities, and space', rating: 4.7, userCount: 100, imageSrc: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb' },
          { title: 'Mechanical Engineering ENME', subject: 'Engineering', description: 'Design of mechanical systems', rating: 4.8, userCount: 100, imageSrc: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad' },
          { title: 'Physics PHYS', subject: 'Sciences', description: 'Study of matter, energy, and their interactions', rating: 4.7, userCount: 85, imageSrc: 'https://images.unsplash.com/photo-1636466497217-06fe9281c558' },
          { title: 'Political Science POLI', subject: 'Social Sciences', description: 'Study of governments and political systems', rating: 4.6, userCount: 90, imageSrc: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9' },
          { title: 'Psychology PSYC', subject: 'Social Sciences', description: 'Study of mind and behavior', rating: 4.8, userCount: 130, imageSrc: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e' },
          { title: 'Software Engineering SENG', subject: 'Engineering', description: 'Engineering principles for software development', rating: 4.9, userCount: 120, imageSrc: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97' },
          { title: 'Sociology SOCI', subject: 'Social Sciences', description: 'Study of human society and relationships', rating: 4.6, userCount: 85, imageSrc: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca' }
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
    const forceReset = process.argv.includes('--force');
    console.log(`Running with forceReset=${forceReset}`);
    await initDatabase();
    await seedDatabase(forceReset || true); // Force reset by default for now
    await prisma.$disconnect();
  }
})();