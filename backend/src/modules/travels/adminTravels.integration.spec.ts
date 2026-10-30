import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  api,
  bearer,
  createUser,
  login,
  PREFIX,
  resetDatabase,
  seedOrganization,
  seedRoles,
} from "@/test/helpers";

const travelInput = {
  name: "Тест аялал",
  slug: "test-travel",
  destinationLabel: "Тэрэлж",
  tagline: null,
  nameEn: null,
  destinationLabelEn: null,
  taglineEn: null,
  descriptionEn: null,
  nameZh: null,
  destinationLabelZh: null,
  taglineZh: null,
  descriptionZh: null,
  nameKo: null,
  destinationLabelKo: null,
  taglineKo: null,
  descriptionKo: null,
  category: "DOMESTIC",
  status: "DRAFT",
  coverImage: null,
  durationDays: 2,
  description: null,
  departures: [
    {
      departureDate: "2027-06-01",
      returnDate: "2027-06-02",
      transportType: "GROUND",
      unitPriceMinor: 250000,
      capacity: 12,
      isBookingOpen: true,
    },
  ],
  sections: [
    {
      title: "Хөтөлбөр",
      description: null,
      titleEn: null,
      descriptionEn: null,
      titleZh: null,
      descriptionZh: null,
      titleKo: null,
      descriptionKo: null,
      mapImage: null,
      images: [],
      sortOrder: 0,
    },
  ],
  details: [
    {
      sectionId: null,
      dayNumber: 1,
      title: "Эхний өдөр",
      content: null,
      titleEn: null,
      contentEn: null,
      titleZh: null,
      contentZh: null,
      titleKo: null,
      contentKo: null,
      images: [],
    },
  ],
} as const;

describe("admin travels (integration)", () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedOrganization();
    const roles = await seedRoles();
    await createUser({ email: "owner@test.mn", password: "Test1234!", roleId: roles.owner });
    await createUser({ email: "viewer@test.mn", password: "Test1234!", roleId: roles.viewer });
  });

  it("нэвтрээгүй хэрэглэгч 401, удирдах эрхгүй хэрэглэгч 403 авна", async () => {
    await api().get(`${PREFIX}/travels`).expect(401);
    const viewerToken = await login("viewer@test.mn", "Test1234!");
    await api().get(`${PREFIX}/travels`).set(bearer(viewerToken)).expect(403);
  });

  it("жагсаалтыг багана бүрийн утгаар хамтатган шүүнэ", async () => {
    const token = await login("owner@test.mn", "Test1234!");
    await prisma.travel.createMany({
      data: [
        {
          name: "Шүүлт таарах аялал",
          slug: "matching-column-filters",
          category: "INTERNATIONAL",
          status: "ARCHIVED",
          durationDays: 9,
        },
        {
          name: "Шүүлт таарахгүй аялал",
          slug: "non-matching-column-filters",
          category: "DOMESTIC",
          status: "PUBLISHED",
          durationDays: 9,
        },
      ],
    });

    const params = new URLSearchParams({
      name: "таарах аялал",
      category: "INTERNATIONAL",
      status: "ARCHIVED",
      durationDays: "9",
    });
    const response = await api()
      .get(`${PREFIX}/travels?${params.toString()}`)
      .set(bearer(token))
      .expect(200);

    expect(response.body.total).toBe(1);
    expect(response.body.items[0]).toEqual(
      expect.objectContaining({ name: "Шүүлт таарах аялал", durationDays: 9 }),
    );
  });

  it("аяллыг nested өгөгдөлтэй үүсгэж, засаж, зөөлөн устгана", async () => {
    const token = await login("owner@test.mn", "Test1234!");
    const created = await api()
      .post(`${PREFIX}/travels`)
      .set(bearer(token))
      .send(travelInput)
      .expect(201);
    const createdDetail = await api()
      .get(`${PREFIX}/travels/${created.body.id}`)
      .set(bearer(token))
      .expect(200);

    expect(createdDetail.body.departures).toHaveLength(1);
    expect(createdDetail.body.sections).toHaveLength(1);
    expect(createdDetail.body.details).toHaveLength(1);

    const updated = await api()
      .patch(`${PREFIX}/travels/${created.body.id}`)
      .set(bearer(token))
      .send({
        ...travelInput,
        name: "Зассан аялал",
        version: createdDetail.body.version,
        departures: createdDetail.body.departures,
        sections: createdDetail.body.sections,
        details: createdDetail.body.details,
      })
      .expect(200);
    expect(updated.body.name).toBe("Зассан аялал");
    expect(updated.body.version).toBe(1);
    const updatedDetail = await api()
      .get(`${PREFIX}/travels/${created.body.id}`)
      .set(bearer(token))
      .expect(200);
    expect(updatedDetail.body.departures[0].version).toBe(0);
    expect(updatedDetail.body.sections[0].version).toBe(0);
    expect(updatedDetail.body.details[0].version).toBe(0);

    await api().delete(`${PREFIX}/travels/${created.body.id}`).set(bearer(token)).expect(204);
    const list = await api().get(`${PREFIX}/travels`).set(bearer(token)).expect(200);
    expect(list.body.total).toBe(0);

    const stored = await prisma.$queryRaw<Array<{ deletedAt: Date | null }>>`
      SELECT "deletedAt" FROM travels WHERE id = ${created.body.id}
    `;
    expect(stored[0]?.deletedAt).toBeInstanceOf(Date);
  });

  it("шинэ аяллын бүлэг болон өдрийг нэг хадгалалтаар холбоно", async () => {
    const token = await login("owner@test.mn", "Test1234!");
    const sectionId = crypto.randomUUID();
    const created = await api()
      .post(`${PREFIX}/travels`)
      .set(bearer(token))
      .send({
        ...travelInput,
        slug: "linked-new-section",
        sections: [{ ...travelInput.sections[0], id: sectionId, _new: true }],
        details: [{ ...travelInput.details[0], sectionId }],
      })
      .expect(201);
    const createdDetail = await api()
      .get(`${PREFIX}/travels/${created.body.id}`)
      .set(bearer(token))
      .expect(200);

    expect(createdDetail.body.sections[0].id).toBe(sectionId);
    expect(createdDetail.body.details[0].sectionId).toBe(sectionId);
  });

  it("олон гаралт, бүлэг, өдрийн хөтөлбөрийг нэг хүсэлтээр хадгална", async () => {
    const token = await login("owner@test.mn", "Test1234!");
    const manyInput = {
      ...travelInput,
      slug: "many-subforms",
      departures: Array.from({ length: 10 }, (_, index) => ({
        ...travelInput.departures[0],
        departureDate: `2027-06-${String(index + 1).padStart(2, "0")}`,
        returnDate: `2027-06-${String(index + 2).padStart(2, "0")}`,
      })),
      sections: Array.from({ length: 10 }, (_, index) => ({
        ...travelInput.sections[0],
        title: `Хөтөлбөр ${index + 1}`,
        sortOrder: index + 1,
      })),
      details: Array.from({ length: 20 }, (_, index) => ({
        ...travelInput.details[0],
        dayNumber: index + 1,
        title: `Өдөр ${index + 1}`,
      })),
    };

    const created = await api()
      .post(`${PREFIX}/travels`)
      .set(bearer(token))
      .send(manyInput)
      .expect(201);
    const createdDetail = await api()
      .get(`${PREFIX}/travels/${created.body.id}`)
      .set(bearer(token))
      .expect(200);

    expect(createdDetail.body.departures).toHaveLength(10);
    expect(createdDetail.body.sections).toHaveLength(10);
    expect(createdDetail.body.details).toHaveLength(20);

    const updated = await api()
      .patch(`${PREFIX}/travels/${created.body.id}`)
      .set(bearer(token))
      .send({
        ...manyInput,
        name: "Олон subform зассан аялал",
        version: createdDetail.body.version,
        departures: [
          ...createdDetail.body.departures,
          {
            ...manyInput.departures[0],
            departureDate: "2027-07-01",
            returnDate: "2027-07-02",
          },
        ],
        sections: [
          ...createdDetail.body.sections,
          { ...manyInput.sections[0], title: "Шинээр нэмсэн бүлэг", sortOrder: 11 },
        ],
        details: [
          ...createdDetail.body.details,
          { ...manyInput.details[0], dayNumber: 21, title: "Шинээр нэмсэн өдөр" },
        ],
      })
      .expect(200);

    expect(updated.body.name).toBe("Олон subform зассан аялал");
    const updatedDetail = await api()
      .get(`${PREFIX}/travels/${created.body.id}`)
      .set(bearer(token))
      .expect(200);
    expect(updatedDetail.body.departures).toHaveLength(11);
    expect(updatedDetail.body.sections).toHaveLength(11);
    expect(updatedDetail.body.details).toHaveLength(21);
  });
});
