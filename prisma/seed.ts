/**
 * Vult de database met één voorbeeldklant, zodat het klantportaal meteen
 * iets laat zien. Draaien met: npm run db:seed
 *
 * Zet SEED_DISCORD_ID op je eigen Discord user-id om de voorbeeldklant aan
 * je eigen account te koppelen.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const inDays = (days: number) => new Date(Date.now() + days * 86_400_000);

async function main() {
  const discordId = process.env.SEED_DISCORD_ID ?? "000000000000000000";

  const customer = await prisma.customer.upsert({
    where: { discordId },
    update: {},
    create: { discordId, name: "Voorbeeld Klant", email: "klant@voorbeeld.nl" },
  });

  const projects = [
    { reference: "NS-1042", name: "Ticket Bot v2", department: "SOFTWARE", status: "IN_PROGRESS", progress: 68, deadline: inDays(16) },
    { reference: "NS-1038", name: "Company Website", department: "SOFTWARE", status: "REVIEW", progress: 92, deadline: inDays(8) },
    { reference: "NS-1031", name: "FiveM Garage Script", department: "GAME", status: "DELIVERED", progress: 100, deadline: inDays(-7) },
    { reference: "NS-1047", name: "Brand Refresh", department: "MEDIA", status: "PLANNED", progress: 10, deadline: inDays(41) },
  ] as const;

  for (const p of projects) {
    await prisma.project.upsert({
      where: { reference: p.reference },
      update: {},
      create: { ...p, customerId: customer.id },
    });
  }

  const botProject = await prisma.project.findUnique({ where: { reference: "NS-1042" } });

  const tickets = [
    { reference: "T-311", subject: "Extra slash command voor rollen", priority: "NORMAL", status: "IN_PROGRESS", projectId: botProject?.id },
    { reference: "T-308", subject: "Contactformulier mail komt niet aan", priority: "HIGH", status: "OPEN", projectId: null },
    { reference: "T-297", subject: "Kleurwijziging garage NUI", priority: "LOW", status: "CLOSED", projectId: null },
  ] as const;

  for (const t of tickets) {
    await prisma.ticket.upsert({
      where: { reference: t.reference },
      update: {},
      create: { ...t, customerId: customer.id },
    });
  }

  console.log(`Klant "${customer.name}" gekoppeld aan Discord-id ${discordId}, met ${projects.length} projecten en ${tickets.length} tickets.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
