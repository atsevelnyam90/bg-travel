-- CreateTable
CREATE TABLE "website_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "website_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_sections" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL DEFAULT 'main',
    "type" TEXT NOT NULL DEFAULT 'content',
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "body" TEXT,
    "imageUrl" TEXT,
    "actionLabel" TEXT,
    "actionHref" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "website_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "website_pages_slug_key" ON "website_pages"("slug");

-- CreateIndex
CREATE INDEX "website_pages_status_sortOrder_idx" ON "website_pages"("status", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "website_sections_pageId_sectionKey_itemKey_key" ON "website_sections"("pageId", "sectionKey", "itemKey");

-- CreateIndex
CREATE INDEX "website_sections_pageId_sortOrder_idx" ON "website_sections"("pageId", "sortOrder");

-- CreateIndex
CREATE INDEX "website_sections_sectionKey_sortOrder_idx" ON "website_sections"("sectionKey", "sortOrder");

-- CreateIndex
CREATE INDEX "website_sections_type_idx" ON "website_sections"("type");

-- AddForeignKey
ALTER TABLE "website_sections" ADD CONSTRAINT "website_sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "website_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
