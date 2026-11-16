const { PrismaClient } = require('@prisma/client');

let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient({
    log: [], // Suppress noisy stderr stack traces when PostgreSQL is offline
  });
}
prisma = global.prisma;

module.exports = prisma;
