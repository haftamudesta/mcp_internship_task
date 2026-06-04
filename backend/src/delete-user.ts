import { prisma } from './lib/prisma';

async function deleteUser() {
  try {
    const deleted = await prisma.user.deleteMany({
      where: {
        email: 'haftish4516@gmail.com'
      }
    });
    console.log(`Deleted ${deleted.count} user(s)`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();