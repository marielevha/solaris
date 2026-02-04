import { describe, expect, it } from "vitest";
import {
  chooseStandardCurrent,
  computeBatteryBank,
  computeController,
  computeEnergyLoad,
  computeEnergyProduced,
  computeInverter,
  computePowerTotal,
  computePV,
  computeSeriesParallel,
  getSystemVoltageAuto,
} from "../calculations";
import { Equipment, LossesConfig } from "../types";

const sampleEquipments: Equipment[] = [
  {
    id: "1",
    name: "Réfrigérateur",
    powerW: 300,
    hoursPerDay: 24,
    quantity: 1,
    type: "continu",
    include: true,
  },
  {
    id: "2",
    name: "TV",
    powerW: 170,
    hoursPerDay: 3,
    quantity: 1,
    type: "intermittent",
    include: true,
  },
  {
    id: "3",
    name: "Spare",
    powerW: 100,
    hoursPerDay: 1,
    quantity: 2,
    type: "intermittent",
    include: false,
  },
];

describe("computeEnergyLoad", () => {
  it("sums included equipment energy", () => {
    const result = computeEnergyLoad(sampleEquipments);
    expect(result.totalWh).toBe(300 * 24 + 170 * 3);
  });
});

describe("computePowerTotal", () => {
  it("sums included power", () => {
    const result = computePowerTotal(sampleEquipments);
    expect(result.totalW).toBe(300 + 170);
  });
});

describe("computeEnergyProduced", () => {
  it("uses simple losses", () => {
    const losses: LossesConfig = { mode: "simple", marginPercent: 25 };
    expect(computeEnergyProduced(1000, losses)).toBe(1250);
  });

  it("uses advanced losses", () => {
    const losses: LossesConfig = {
      mode: "advanced",
      inverterEfficiency: 90,
      controllerEfficiency: 95,
      cableLossPercent: 2,
      tempLossPercent: 5,
    };
    const result = computeEnergyProduced(1000, losses);
    const expected = 1000 / (0.9 * 0.95 * 0.98 * 0.95);
    expect(result).toBeCloseTo(expected, 5);
  });
});

describe("computeBatteryBank", () => {
  it("rounds up to nearest 10Ah", () => {
    const result = computeBatteryBank(1000, 1, 12, 80);
    expect(result.requiredAh).toBe(110);
  });
});

describe("computeSeriesParallel", () => {
  it("returns compatibility and counts", () => {
    const result = computeSeriesParallel(24, 12, 500, 250);
    expect(result).toEqual({
      isCompatible: true,
      seriesCount: 2,
      parallelCount: 2,
      totalBatteries: 4,
    });
  });

  it("flags incompatible voltages", () => {
    const result = computeSeriesParallel(24, 10, 500, 250);
    expect(result.isCompatible).toBe(false);
  });
});

describe("computePV", () => {
  it("computes pv sizing", () => {
    const result = computePV(2000, 5, 10, 400);
    expect(result.moduleCount).toBe(2);
    expect(result.installedPowerWp).toBe(800);
  });
});

describe("computeController", () => {
  it("chooses standard current", () => {
    const result = computeController(1200, 12);
    expect(result.standardCurrentA).toBe(150);
    expect(chooseStandardCurrent(101)).toBe(120);
  });
});

describe("computeInverter", () => {
  it("applies surge power", () => {
    const result = computeInverter(470, 25, true, sampleEquipments);
    expect(result.recommendedPowerW).toBeGreaterThan(result.basePowerW);
    expect(result.surgePowerW).toBe(300 * 2 + 170);
  });
});

describe("getSystemVoltageAuto", () => {
  it("selects voltage based on power", () => {
    expect(getSystemVoltageAuto(900)).toBe(12);
    expect(getSystemVoltageAuto(1500)).toBe(24);
    expect(getSystemVoltageAuto(2500)).toBe(48);
  });
});
