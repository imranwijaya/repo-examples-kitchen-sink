import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const posts = [
  {
    id: 1,
    title: 'This data comes from the backend (a)',
  },
  {
    id: 2,
    title: 'This data comes from the backend (b)',
  },
  {
    id: 3,
    title: 'This data comes from the backend (c)',
  },
  {
    id: 4,
    title: 'This data comes from the backend (d)',
  },
  {
    id: 5,
    title: 'This data comes from the backend (e)',
  },
  {
    id: 6,
    title: 'This data comes from the backend (f)',
  },
  {
    id: 7,
    title: 'This data comes from the backend (g)',
  },
  {
    id: 8,
    title: 'This data comes from the backend (h)',
  },
  {
    id: 9,
    title: 'This data comes from the backend (i)',
  },
  {
    id: 10,
    title: 'This data comes from the backend (j)',
  },
  {
    id: 11,
    title: 'This data comes from the backend (k)',
  },
  {
    id: 12,
    title: 'This data comes from the backend (l)',
  },
  {
    id: 13,
    title: 'This data comes from the backend (m)',
  },
  {
    id: 14,
    title: 'This data comes from the backend (n)',
  },
  {
    id: 15,
    title: 'This data comes from the backend (o)',
  },
  {
    id: 16,
    title: 'This data comes from the backend (p)',
  },
  {
    id: 17,
    title: 'This data comes from the backend (q)',
  },
  {
    id: 18,
    title: 'This data comes from the backend (r)',
  },
  {
    id: 19,
    title: 'This data comes from the backend (s)',
  },
  {
    id: 20,
    title: 'This data comes from the backend (t)',
  },
  {
    id: 21,
    title: 'This data comes from the backend (u)',
  },
  {
    id: 22,
    title: 'This data comes from the backend (v)',
  },
  {
    id: 23,
    title: 'This data comes from the backend (w)',
  },
  {
    id: 24,
    title: 'This data comes from the backend (x)',
  },
  {
    id: 25,
    title: 'This data comes from the backend (y)',
  },
  {
    id: 26,
    title: 'This data comes from the backend (z)',
  },
];

async function main() {
  console.log('Seeding database...');
  const inserts = [];

  for (const data of posts) {
    inserts.push(prisma.post.create({ data }));
  }

  await prisma.$transaction(inserts);
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
