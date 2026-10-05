import { prisma } from "../src/server/db";

async function main() {
  const rows = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`;
  console.log(`Database connection OK: SELECT 1 returned ${rows[0].ok}`);
}

main()
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
