"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { usePublicTravel } from "../hooks/usePublicTravel";
import {
  hydrateLostGenerationSnapshot,
  prepareLostGenerationSnapshot,
} from "../lostGenerationSnapshotAdapter";
import styles from "./lostGenerationSnapshot.module.css";

export function BlackTomatoLostGenerationSnapshotPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug")?.trim() ?? "";
  const travelQuery = usePublicTravel(slug);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const hydrateFrame = useCallback(() => {
    const document = frameRef.current?.contentDocument;
    if (!document) return;
    prepareLostGenerationSnapshot(document);
    if (!travelQuery.data) return;
    hydrateLostGenerationSnapshot(document, travelQuery.data);
  }, [travelQuery.data]);

  useEffect(() => {
    hydrateFrame();
  }, [hydrateFrame]);

  return (
    <main className={styles.viewport}>
      <iframe
        className={styles.snapshot}
        onLoad={hydrateFrame}
        ref={frameRef}
        sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin"
        src="/destinations/france/the-lost-generation/index.html"
        title={travelQuery.data?.name ?? "Аяллын дэлгэрэнгүй"}
      />
      {slug && travelQuery.isError ? (
        <div className={styles.error}>Аяллын мэдээлэл олдсонгүй.</div>
      ) : null}
    </main>
  );
}
