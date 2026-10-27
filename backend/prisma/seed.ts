import { SYSTEM_ROLES } from "@winu/contracts";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/modules/auth/passwordService";
import { seedTravelDemo } from "../src/modules/travels/seedTravelDemo";

const ORG_SLUG = process.env.SEED_ORG_SLUG ?? "demo";
const ORG_NAME = process.env.SEED_ORG_NAME ?? "Demo ХХК";
const OWNER_EMAIL = (process.env.SEED_OWNER_EMAIL ?? "owner@example.mn").toLowerCase();
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD ?? "ChangeMe123!";
const DEFAULT_PASSWORD = "password1";

async function main() {
  if (process.env.NODE_ENV === "production" && OWNER_PASSWORD === DEFAULT_PASSWORD) {
    throw new Error(
      "Production-д SEED_OWNER_PASSWORD заавал өгнө үү (default нууц үг зөвшөөрөгдөхгүй).",
    );
  }

  const organization = await prisma.organization.upsert({
    where: { slug: ORG_SLUG },
    update: {},
    create: { slug: ORG_SLUG, name: ORG_NAME },
  });

  const roles: Record<string, string> = {};
  for (const [name, permissions] of Object.entries(SYSTEM_ROLES)) {
    const role = await prisma.role.upsert({
      where: { name },
      update: { permissions: [...permissions] },
      create: { name, permissions: [...permissions], isSystem: true },
    });
    roles[name] = role.id;
  }

  const owner = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: { roleId: roles.owner },
    create: {
      email: OWNER_EMAIL,
      name: "Owner",
      passwordHash: await hashPassword(OWNER_PASSWORD),
      status: "ACTIVE",
      roleId: roles.owner,
    },
  });

  const demoTravel =
    process.env.NODE_ENV !== "production" || process.env.SEED_DEMO_TRAVELS === "true"
      ? await seedTravelDemo()
      : null;

  console.log(`✓ Байгууллага: ${organization.name} (${organization.slug})`);
  console.log(`✓ Role: ${Object.keys(roles).join(", ")}`);
  console.log(`✓ Owner: ${owner.email}`);
  if (demoTravel) {
    console.log(
      `✓ Demo Travel: ${demoTravel.slug} (${demoTravel.created.travel} travel, ${demoTravel.created.departures} departures, ${demoTravel.created.details} details created)`,
    );
  }
  if (OWNER_PASSWORD === DEFAULT_PASSWORD) {
    console.log(`⚠️  Нууц үг default (${DEFAULT_PASSWORD}) — заавал соль.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
