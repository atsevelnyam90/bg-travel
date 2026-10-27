"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef } from "react";
import { usePublicTravel } from "../hooks/usePublicTravel";
import { usePublicTravels } from "../hooks/usePublicTravels";
import { selectSimilarTrips } from "../lostGenerationSimilarTrips";
import {
  hydrateLostGenerationSnapshot,
  prepareLostGenerationSnapshot,
} from "../lostGenerationSnapshotAdapter";
import styles from "./lostGenerationSnapshot.module.css";

export function BlackTomatoLostGenerationSnapshotPage() {
  const t = useTranslations("publicJourney.ui");
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug")?.trim() ?? "";
  const travelQuery = usePublicTravel(slug);
  const travelsQuery = usePublicTravels();
  const frameRef = useRef<HTMLIFrameElement>(null);

  const hydrateFrame = useCallback(() => {
    const document = frameRef.current?.contentDocument;
    if (!document) return;
    prepareLostGenerationSnapshot(document);
    if (!travelQuery.data) return;
    const similarTrips = selectSimilarTrips(travelQuery.data, travelsQuery.data ?? []);
    hydrateLostGenerationSnapshot(document, travelQuery.data, {
      labels: {
        durationDays: (count) => t("durationDays", { count }),
        exploreTrip: t("exploreTrip"),
        journeys: t("journeys"),
        nextSimilarTrips: t("nextSimilarTrips"),
        previousSimilarTrips: t("previousSimilarTrips"),
        similarTrips: t("similarTrips"),
        similarTripsSubtitle: t("similarTripsSubtitle"),
      },
      similarTrips,
    });
  }, [t, travelQuery.data, travelsQuery.data]);

  useEffect(() => {
    hydrateFrame();
  }, [hydrateFrame]);

  return (
    <main className={styles.viewport}>
      <iframe
        className={styles.snapshot}
        onLoad={hydrateFrame}
        ref={frameRef}
        sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-top-navigation-by-user-activation"
        src="/travel-detail/index.html"
        title={travelQuery.data?.name ?? "Аяллын дэлгэрэнгүй"}
      />
      {slug && travelQuery.isError ? (
        <div className={styles.error}>Аяллын мэдээлэл олдсонгүй.</div>
      ) : null}
    </main>
  );
}
