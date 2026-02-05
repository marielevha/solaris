"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { buildAdContext } from "@/domain/ads/buildAdContext";
import { selectAd } from "@/domain/ads/selectAd";
import { useSolarStore } from "@/store/solarStore";
import type { Ad, AdContext, AdPlacement } from "@/types/ads";
import { SponsoredCard } from "./SponsoredCard";

type AdSlotProps = {
  placement: AdPlacement;
  variant?: "compact" | "full";
};

const IMPRESSIONS_KEY = "ads_impressions";
let hasHydratedStore = false;

const readImpressions = () => {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem(IMPRESSIONS_KEY);
    return stored ? (JSON.parse(stored) as Record<string, true>) : {};
  } catch {
    return {};
  }
};

const markImpression = (key: string) => {
  if (typeof window === "undefined") return;
  const current = readImpressions();
  current[key] = true;
  sessionStorage.setItem(IMPRESSIONS_KEY, JSON.stringify(current));
};

const sendAdEvent = async (payload: {
  adId: string;
  type: "impression" | "click";
  placement: AdPlacement;
  context?: AdContext;
}) => {
  const body = JSON.stringify(payload);
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/ads/event", blob);
    return;
  }
  await fetch("/api/ads/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
};

const getCountryFromLocale = (locale?: string) => {
  if (!locale) return undefined;
  const parts = locale.split("-");
  return parts.length > 1 ? parts[1].toUpperCase() : undefined;
};

export const AdSlot = ({ placement, variant = "compact" }: AdSlotProps) => {
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [country, setCountry] = useState<string | undefined>(undefined);
  const { psh, equipments, losses, voltageMode, manualVoltage, battery, pv } =
    useSolarStore();

  const baseContext = useMemo(
    () =>
      buildAdContext({
        psh,
        equipments,
        losses,
        voltageMode,
        manualVoltage,
        battery,
        pv,
      }),
    [psh, equipments, losses, voltageMode, manualVoltage, battery, pv],
  );

  const context = useMemo(
    () => ({
      ...baseContext,
      country,
    }),
    [baseContext, country],
  );

  const selectedAd = useMemo(
    () => selectAd(ads, placement, context),
    [ads, placement, context],
  );

  const debugEnabled = searchParams.get("debug") === "1";

  useEffect(() => {
    if (!hasHydratedStore) {
      useSolarStore.persist.rehydrate();
      hasHydratedStore = true;
    }
    if (typeof window === "undefined") return;
    setCountry(getCountryFromLocale(navigator.language));
  }, []);

  useEffect(() => {
    const loadAds = async () => {
      const response = await fetch(`/api/ads?placement=${placement}`);
      if (!response.ok) {
        setAds([]);
        return;
      }
      const data = (await response.json()) as { ads: Ad[] };
      setAds(data.ads);
    };
    loadAds();
  }, [placement]);

  useEffect(() => {
    if (!selectedAd) return;
    const impressionKey = `${selectedAd.id}:${placement}`;
    const sendImpression = () => {
      if (readImpressions()[impressionKey]) return;
      void sendAdEvent({
        adId: selectedAd.id,
        type: "impression",
        placement,
        context,
      });
      markImpression(impressionKey);
    };

    if (typeof window === "undefined") return;
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      sendImpression();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            sendImpression();
          }
        });
      },
      { threshold: 0.4 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [selectedAd, placement, context]);

  if (!selectedAd) return null;

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      <SponsoredCard
        ad={selectedAd}
        variant={variant}
        onCtaClick={() =>
          void sendAdEvent({
            adId: selectedAd.id,
            type: "click",
            placement,
            context,
          })
        }
      />
      {debugEnabled && (
        <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <div>Debug ads</div>
          <div>ID: {selectedAd.id}</div>
          <div>Placement: {placement}</div>
        </div>
      )}
    </div>
  );
};
