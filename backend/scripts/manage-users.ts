/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';
import * as process from 'process';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function main() {
  console.log('\n📋 User Management CLI');
  console.log('=====================\n');

  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('\n💡 Make sure:');
    console.log('   1. Your .env file exists with DATABASE_URL');
    console.log('   2. You have run npx prisma generate');
    console.log('   3. Your database is running\n');
    process.exit(1);
  }

  const action = await question('What do you want to do? (list/update/delete/exit): ');

  if (action === 'list') {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    console.log('\n📊 All Users:');
    console.log('='.repeat(80));
    users.forEach((user) => {
      const nameDisplay = user.name ? user.name.padEnd(20) : 'No name'.padEnd(20);
      console.log(
        `${user.email.padEnd(30)} | ${nameDisplay} | ${user.role}`
      );
    });
    console.log('='.repeat(80));
  } 
  else if (action === 'update') {
    const email = await question('Enter user email: ');
    const newRole = await question('Enter new role (USER/OWNER/ADMIN): ');

    if (!['USER', 'OWNER', 'ADMIN'].includes(newRole.toUpperCase())) {
      console.log('❌ Invalid role! Please use USER, OWNER, or ADMIN');
      rl.close();
      return;
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: newRole.toUpperCase() as any },
      });

      console.log(`\n✅ User ${updatedUser.email} role updated to: ${updatedUser.role}`);
    } catch (error) {
      console.log(`\n❌ User with email ${email} not found`);
    }
  } 
  else if (action === 'delete') {
    const email = await question('Enter user email to delete: ');
    const confirm = await question(`Are you sure you want to delete ${email}? (yes/no): `);

    if (confirm.toLowerCase() === 'yes') {
      try {
        await prisma.user.delete({ where: { email } });
        console.log(`\n✅ User ${email} deleted successfully`);
      } catch (error) {
        console.log(`\n❌ User with email ${email} not found`);
      }
    } else {
      console.log('\n❌ Deletion cancelled');
    }
  }
  else if (action === 'exit') {
    console.log('\n👋 Goodbye!');
    rl.close();
    return;
  }

  rl.close();
  await prisma.$disconnect();
}

main().catch(console.error);