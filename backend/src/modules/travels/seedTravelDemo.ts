import { prismaUnfiltered } from "@/lib/prisma";

const DEMO_TRAVEL = {
  name: "Вьетнам 3 хот аялал",
  slug: "vietnam-three-cities",
  destinationLabel: "ХӨХХОТ · ХАНОЙ · КАТ БА · ХАЛОНГ",
  tagline: "ХОТЫН СОЁЛ, АРЛЫН АМРАЛТ, БУЛАНГИЙН АДАЛ ЯВДАЛ",
  category: "INTERNATIONAL" as const,
  status: "PUBLISHED" as const,
  coverImage: "/images/trips/vietnam-three-cities/hanoi-old-quarter.jpg",
  durationDays: 8,
  description:
    "Хөххот, Ханой, Кат Ба, Халонг чиглэлийн түүх, байгаль, далайн амралтыг хослуулсан найман өдрийн аялал.",
};

const DEMO_SECTIONS = [
  {
    title: "ХӨХХОТ & ХАНОЙ",
    description:
      "Хөххотоос аяллаа эхлүүлж, Ханойн түүхэн дурсгал, хуучны гудамж болон орчин үеийн хэмнэлийг танина.",
    images: [
      "/images/trips/vietnam-three-cities/hanoi-old-quarter.jpg",
      "/images/trips/vietnam-three-cities/hanoi-mausoleum.jpg",
      "/images/trips/vietnam-three-cities/one-pillar-pagoda.jpg",
    ],
    sortOrder: 1,
    days: [1, 2, 3],
  },
  {
    title: "КАТ БА & ХАЛОНГ",
    description:
      "Далайн эргийн амралт, шохойн чулуун арлууд, усан онгоцны аяллыг нэг хэсэгт төвлөрүүлнэ.",
    images: [
      "/images/trips/vietnam-three-cities/cat-ba-beach.jpg",
      "/images/trips/vietnam-three-cities/halong-bay.jpg",
      "/images/trips/vietnam-three-cities/halong-cruise.jpg",
      "/images/trips/vietnam-three-cities/halong-cave.jpg",
    ],
    sortOrder: 2,
    days: [4, 5, 6],
  },
  {
    title: "БУЦАХ ЗАМ",
    description: "Ханойгоос Хөххотоор дамжин Эрээнд хүрснээр аялал өндөрлөнө.",
    images: [
      "/images/trips/vietnam-three-cities/vietnam-travelers.jpg",
      "/images/trips/vietnam-three-cities/flight-home.jpg",
    ],
    sortOrder: 3,
    days: [7, 8],
  },
] as const;

const DEMO_DEPARTURES = [
  {
    departureDate: "2027-03-08",
    returnDate: "2027-03-15",
    transportType: "GROUND" as const,
    unitPriceMinor: 350_000_000n,
    capacity: 20,
  },
  {
    departureDate: "2027-03-08",
    returnDate: "2027-03-15",
    transportType: "DIRECT_FLIGHT" as const,
    unitPriceMinor: 420_000_000n,
    capacity: 20,
  },
  {
    departureDate: "2027-04-12",
    returnDate: "2027-04-19",
    transportType: "GROUND" as const,
    unitPriceMinor: 350_000_000n,
    capacity: 20,
  },
  {
    departureDate: "2027-04-12",
    returnDate: "2027-04-19",
    transportType: "DIRECT_FLIGHT" as const,
    unitPriceMinor: 420_000_000n,
    capacity: 20,
  },
];

function richTextContent(points: readonly string[], meals: string, hotel?: string): string {
  const summary = [`Хоол: ${meals}`, hotel ? `Буудал: ${hotel}` : null].filter(
    (value): value is string => value !== null,
  );

  return JSON.stringify({
    type: "doc",
    content: [
      {
        type: "bulletList",
        content: points.map((point) => ({
          type: "listItem",
          content: [{ type: "paragraph", content: [{ type: "text", text: point }] }],
        })),
      },
      ...summary.map((text) => ({
        type: "paragraph",
        content: [{ type: "text", marks: [{ type: "bold" }], text }],
      })),
    ],
  });
}

const DEMO_DETAILS = [
  {
    dayNumber: 1,
    title: "Эрээн–Хөххот · аяллын автобус",
    content: richTextContent(
      [
        "Энэ өдөр бид Эрээн хотод уулзан Хөххотын зүг хөдөлнө.",
        "Хөххот нь Өвөр Монголын нийслэл тул буудалдаа байрласны дараа цагаа хүссэнээрээ өнгөрөөх боломжтой.",
        "Орой Хөххот дахь буудалдаа амарна.",
      ],
      "--- / --- / ---",
      "Хөххот",
    ),
    images: [
      "/images/trips/vietnam-three-cities/hanoi-route-map.jpg",
      "/images/trips/vietnam-three-cities/cat-ba-harbor.jpg",
    ],
  },
  {
    dayNumber: 2,
    title: "Хөххот–Ханой · олон улсын нислэг",
    content: richTextContent(
      [
        "Өглөөний цайны дараа нисэх онгоцны буудал руу хөдөлж, нислэгээс 2–3 цагийн өмнө бүртгэлээ хийлгэнэ.",
        "Гуанжөү хотоор транзит хийх хугацаанд нисэх буудалд амрах, худалдан авалт хийх боломжтой.",
        "Ханой хотод буусны дараа буудалдаа байрлан амарна.",
      ],
      "Өглөө / Өдөр (онгоцонд) / ---",
      "Ханой",
    ),
    images: [
      "/images/trips/vietnam-three-cities/hanoi-route-map.jpg",
      "/images/trips/vietnam-three-cities/cat-ba-harbor.jpg",
    ],
  },
  {
    dayNumber: 3,
    title: "Ханой хотын аялал · Кат Ба руу",
    content: richTextContent(
      [
        "Ба Динь талбайгаар зочлон дурсгалын зургаа татуулна.",
        "Хо Ши Миний хуучин байр болон Нэг тулгуурт сүмтэй танилцана.",
        "Өдрийн аяллын дараа усан онгоцоор Кат Ба аралд хүрнэ.",
      ],
      "Өглөө / Өдөр / ---",
      "Кат Ба арлын далайн эргийн буудал",
    ),
    images: [
      "/images/trips/vietnam-three-cities/hanoi-mausoleum.jpg",
      "/images/trips/vietnam-three-cities/hanoi-old-quarter.jpg",
      "/images/trips/vietnam-three-cities/one-pillar-pagoda.jpg",
      "/images/trips/vietnam-three-cities/hoan-kiem-lake.jpg",
    ],
  },
  {
    dayNumber: 4,
    title: "Кат Ба арал · чөлөөт өдөр",
    content: richTextContent(
      [
        "Кат Ба арлын далайн эргээр зугаалж, өдрийг өөрийн хэмнэлээр өнгөрөөнө.",
        "Саун, бассейн, жакузид үнэ төлбөргүй үйлчлүүлэх боломжтой.",
        "Хөтөчөөс зөвлөгөө аван нэмэлт аяллаа хувиараа зохион байгуулж болно.",
      ],
      "Өглөө / --- / ---",
      "Кат Ба арлын далайн эргийн буудал",
    ),
    images: [
      "/images/trips/vietnam-three-cities/cat-ba-hotel.jpg",
      "/images/trips/vietnam-three-cities/cat-ba-beach.jpg",
      "/images/trips/vietnam-three-cities/cat-ba-cliffs.jpg",
    ],
  },
  {
    dayNumber: 5,
    title: "Халонг булан · чөлөөт өдөр",
    content: richTextContent(
      [
        "Өглөөний цайны дараа буудлаа хүлээлгэн өгч Халонг булангийн зүг хөдөлнө.",
        "Дүүжин тээврээр Кат Ба арлыг дээрээс тольдох боломжтой.",
        "Халонгт чөлөөт цагаа өнгөрүүлсний дараа Ханой хотын зүг хөдөлнө.",
      ],
      "Өглөө / Өдөр / ---",
      "Халонг",
    ),
    images: [
      "/images/trips/vietnam-three-cities/halong-hotel-pool.jpg",
      "/images/trips/vietnam-three-cities/cat-ba-group.jpg",
    ],
  },
  {
    dayNumber: 6,
    title: "Халонг арлууд · усан онгоцны аялал",
    content: richTextContent(
      [
        "Халонг булангаар ойролцоогоор 3.5 цагийн усан онгоцны аялал хийнэ.",
        "Усан онгоцон дээр Вьетнам загасчдын далайн бүтээгдэхүүний зоог амтална.",
        "Диваажингийн арал, Сарны агуйгаар аялж, хурдны завиар буланг тойрно.",
        "Орой Ханой хотын зүг буцна.",
      ],
      "Өглөө / Өдөр (усан онгоцонд) / ---",
      "Ханой",
    ),
    images: [
      "/images/trips/vietnam-three-cities/halong-water-puppets.jpg",
      "/images/trips/vietnam-three-cities/halong-bay.jpg",
      "/images/trips/vietnam-three-cities/halong-cruise.jpg",
      "/images/trips/vietnam-three-cities/halong-cave.jpg",
      "/images/trips/vietnam-three-cities/halong-panorama.png",
    ],
  },
  {
    dayNumber: 7,
    title: "Ханой–Хөххот · буцах нислэг",
    content: richTextContent(
      [
        "Өглөөний цайны дараа Ханойн нисэх онгоцны буудал руу хөдөлнө.",
        "Гуанжөү хотоор транзит хийн Хөххотод бууна.",
        "Орой буудалдаа байрлан амарна.",
      ],
      "Өглөө / Өдөр (онгоцонд) / ---",
      "Хөххот",
    ),
    images: [
      "/images/trips/vietnam-three-cities/flight-home.jpg",
      "/images/trips/vietnam-three-cities/vietnam-travelers.jpg",
    ],
  },
  {
    dayNumber: 8,
    title: "Хөххот–Эрээн · аяллын төгсгөл",
    content: richTextContent(
      [
        "Өглөөний цайны дараа Эрээн хотын зүг хөдөлнө.",
        "Эрээн хотод ирснээр аялал өндөрлөж, аялагчид дараагийн маршрутаа үргэлжлүүлэх боломжтой.",
      ],
      "Өглөө / --- / ---",
    ),
    images: [
      "/images/trips/vietnam-three-cities/flight-home.jpg",
      "/images/trips/vietnam-three-cities/gems-gallery-pattaya.jpg",
    ],
  },
];

type SeedTravelDemoResult = {
  created: { departures: number; details: number; sections: number; travel: number };
  skippedDeletedTravel: boolean;
  slug: string;
};

export async function seedTravelDemo(): Promise<SeedTravelDemoResult> {
  // Seed дахин ажиллахдаа админаас soft-delete хийсэн demo-г сэргээхгүй байх ёстой.
  return prismaUnfiltered.$transaction(async (tx) => {
    const created = { departures: 0, details: 0, sections: 0, travel: 0 };
    let travel = await tx.travel.findUnique({ where: { slug: DEMO_TRAVEL.slug } });

    if (travel?.deletedAt) {
      return { created, skippedDeletedTravel: true, slug: DEMO_TRAVEL.slug };
    }

    if (!travel) {
      travel = await tx.travel.create({ data: DEMO_TRAVEL });
      created.travel += 1;
    }

    for (const departure of DEMO_DEPARTURES) {
      const departureDate = new Date(`${departure.departureDate}T00:00:00.000Z`);
      const existing = await tx.travelDeparture.findFirst({
        where: { travelId: travel.id, departureDate, transportType: departure.transportType },
      });
      if (existing) continue;

      await tx.travelDeparture.create({
        data: {
          ...departure,
          travelId: travel.id,
          departureDate,
          returnDate: new Date(`${departure.returnDate}T00:00:00.000Z`),
          isBookingOpen: true,
        },
      });
      created.departures += 1;
    }

    const sectionIdByDay = new Map<number, string>();
    for (const section of DEMO_SECTIONS) {
      let row = await tx.travelItinerarySection.findFirst({
        where: { travelId: travel.id, title: section.title, deletedAt: null },
      });
      if (!row) {
        row = await tx.travelItinerarySection.create({
          data: {
            travelId: travel.id,
            title: section.title,
            description: section.description,
            images: [...section.images],
            sortOrder: section.sortOrder,
          },
        });
        created.sections += 1;
      }
      for (const day of section.days) sectionIdByDay.set(day, row.id);
    }

    for (const detail of DEMO_DETAILS) {
      const existing = await tx.travelDetail.findFirst({
        where: { travelId: travel.id, dayNumber: detail.dayNumber, deletedAt: null },
      });
      const sectionId = sectionIdByDay.get(detail.dayNumber);
      if (existing) {
        if (existing.sectionId !== sectionId) {
          await tx.travelDetail.update({
            where: { id: existing.id },
            data: { sectionId, version: { increment: 1 } },
          });
        }
        continue;
      }

      await tx.travelDetail.create({
        data: { ...detail, travelId: travel.id, sectionId },
      });
      created.details += 1;
    }

    return { created, skippedDeletedTravel: false, slug: travel.slug };
  });
}
