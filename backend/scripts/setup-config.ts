import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Sets the recruitment settings (open/closed + form deadline) in the database DATABASE_URL points to.
// Adds nothing else: no sample questions, slots or admins (use this, not db:seed, on the real database).
//
// Usage:
//   npx tsx scripts/setup-config.ts 2026-11-20T23:59          open, deadline in India time
//   npx tsx scripts/setup-config.ts 2026-11-20T23:59 --closed  set the deadline but keep applications closed
//   npx tsx scripts/setup-config.ts                            show the current settings

const prisma = new PrismaClient();

async function main() {
  const [when, flag] = process.argv.slice(2);
  const db = (process.env.DATABASE_URL ?? "").replace(/\/\/[^@]*@/, "//<hidden>@").replace(/\?.*/, "");
  console.log(`Database: ${db}`);

  if (!when) {
    const config = await prisma.recruitmentConfig.findUnique({ where: { key: "main" } });
    console.log(config ? config : "Not set up yet. Pass a deadline, e.g. 2026-11-20T23:59");
    return;
  }

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(when)) {
    throw new Error("Deadline must look like 2026-11-20T23:59 (India time)");
  }
  const formDeadline = new Date(`${when}:00+05:30`);
  if (isNaN(formDeadline.getTime())) throw new Error("That isn't a real date");
  if (formDeadline <= new Date()) throw new Error("The deadline is in the past");
  const isOpen = flag !== "--closed";

  const config = await prisma.recruitmentConfig.upsert({
    where: { key: "main" },
    update: { formDeadline, isOpen },
    create: { key: "main", formDeadline, isOpen },
  });
  const ist = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" });
  console.log(`Saved: applications ${config.isOpen ? "OPEN" : "CLOSED"}, deadline ${ist.format(config.formDeadline)} (India time)`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
