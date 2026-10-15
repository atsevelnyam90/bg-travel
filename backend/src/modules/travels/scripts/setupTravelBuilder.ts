import { prisma, prismaUnfiltered } from "@/lib/prisma";
import { setupTravelBuilder } from "../setupTravelBuilder";

try {
  const result = await setupTravelBuilder();
  console.log(`Travel builder: ${result.created.length} definitions/views created.`);
  console.log(`Travel builder: ${result.updated.length} definitions/views updated.`);
  console.log(`Travel view: ${result.viewId}`);
} finally {
  await prisma.$disconnect();
  await prismaUnfiltered.$disconnect();
}
