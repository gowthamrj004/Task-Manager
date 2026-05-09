import prisma from './src/utils/db.js';
import { hashPassword } from './src/utils/password.js';

async function seed() {
  try {
    // Clear existing data
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    // Create demo users
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: await hashPassword('password123'),
        fullName: 'Admin User',
        role: 'ADMIN',
      },
    });

    const memberUser = await prisma.user.create({
      data: {
        email: 'member@example.com',
        password: await hashPassword('password123'),
        fullName: 'Team Member',
        role: 'MEMBER',
      },
    });

    // Create demo projects
    const project1 = await prisma.project.create({
      data: {
        name: 'Website Redesign',
        description: 'Redesign the company website with modern UI/UX',
        ownerId: adminUser.id,
      },
    });

    const project2 = await prisma.project.create({
      data: {
        name: 'Mobile App',
        description: 'Build a mobile app for iOS and Android',
        ownerId: adminUser.id,
      },
    });

    // Create demo tasks for project 1
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    await prisma.task.create({
      data: {
        title: 'Design mockups',
        description: 'Create wireframes and design mockups for the homepage',
        status: 'DOING',
        dueDate: tomorrow,
        projectId: project1.id,
        assigneeId: adminUser.id,
      },
    });

    await prisma.task.create({
      data: {
        title: 'Setup database',
        description: 'Configure MySQL database and create tables',
        status: 'DONE',
        dueDate: new Date(),
        projectId: project1.id,
        assigneeId: memberUser.id,
      },
    });

    await prisma.task.create({
      data: {
        title: 'Frontend development',
        description: 'Build React components for the website',
        status: 'TODO',
        dueDate: nextWeek,
        projectId: project1.id,
      },
    });

    // Create demo tasks for project 2
    await prisma.task.create({
      data: {
        title: 'App architecture',
        description: 'Plan the app structure and technology stack',
        status: 'DOING',
        dueDate: tomorrow,
        projectId: project2.id,
        assigneeId: adminUser.id,
      },
    });

    await prisma.task.create({
      data: {
        title: 'API development',
        description: 'Build REST APIs for the mobile app',
        status: 'TODO',
        dueDate: nextWeek,
        projectId: project2.id,
      },
    });

    console.log('✓ Seed data created successfully');
    console.log('\nDemo Accounts:');
    console.log('Admin - Email: admin@example.com, Password: password123');
    console.log('Member - Email: member@example.com, Password: password123');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
