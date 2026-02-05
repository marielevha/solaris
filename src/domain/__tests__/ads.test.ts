import { describe, expect, it } from "vitest";
import { selectAd } from "../ads/selectAd";
import type { Ad, AdContext } from "../../types/ads";

const baseAd: Ad = {
  id: "ad-1",
  active: true,
  priority: 0,
  placement: ["results"],
  title: "Test",
  description: "Test",
  cta: "Voir",
  href: "https://example.com",
  sponsorLabel: "Sponsorisé",
};

const withAd = (partial: Partial<Ad>): Ad => ({
  ...baseAd,
  ...partial,
});

describe("selectAd", () => {
  it("filters by placement", () => {
    const ads = [
      withAd({ id: "a", placement: ["header"] }),
      withAd({ id: "b", placement: ["results"] }),
    ];
    const selected = selectAd(ads, "results", {});
    expect(selected?.id).toBe("b");
  });

  it("returns null when no active ads match", () => {
    const ads = [withAd({ id: "a", active: false })];
    const selected = selectAd(ads, "results", {});
    expect(selected).toBeNull();
  });

  it("sorts by priority desc", () => {
    const ads = [
      withAd({ id: "a", priority: 1 }),
      withAd({ id: "b", priority: 3 }),
    ];
    const selected = selectAd(ads, "results", {});
    expect(selected?.id).toBe("b");
  });

  it("uses id asc as tie-breaker", () => {
    const ads = [
      withAd({ id: "b", priority: 2 }),
      withAd({ id: "a", priority: 2 }),
    ];
    const selected = selectAd(ads, "results", {});
    expect(selected?.id).toBe("a");
  });

  it("does not exclude when country is undefined", () => {
    const ads = [
      withAd({
        id: "a",
        targeting: { countries: ["FR"] },
      }),
    ];
    const selected = selectAd(ads, "results", {});
    expect(selected?.id).toBe("a");
  });

  it("filters by min/max pv kw", () => {
    const ads = [
      withAd({ id: "a", targeting: { minPvKw: 2, maxPvKw: 4 } }),
      withAd({ id: "b", targeting: { minPvKw: 5 } }),
    ];
    const context: AdContext = { pvKw: 3 };
    const selected = selectAd(ads, "results", context);
    expect(selected?.id).toBe("a");
  });

  it("filters by system voltages", () => {
    const ads = [
      withAd({ id: "a", targeting: { systemVoltages: [24] } }),
      withAd({ id: "b", targeting: { systemVoltages: [48] } }),
    ];
    const selected = selectAd(ads, "results", { systemVoltage: 48 });
    expect(selected?.id).toBe("b");
  });

  it("filters by battery type", () => {
    const ads = [
      withAd({ id: "a", targeting: { batteryTypes: ["AGM"] } }),
      withAd({ id: "b", targeting: { batteryTypes: ["LiFePO4"] } }),
    ];
    const selected = selectAd(ads, "results", { batteryType: "LiFePO4" });
    expect(selected?.id).toBe("b");
  });
});
