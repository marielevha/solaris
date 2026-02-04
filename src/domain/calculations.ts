import {
  BatteryBankResult,
  ControllerResult,
  EnergyLoadResult,
  Equipment,
  InverterResult,
  LossesConfig,
  PVResult,
  PowerTotalResult,
  SeriesParallelResult,
} from "./types";

const STANDARD_CONTROLLER_CURRENTS = [
  10,
  20,
  30,
  40,
  50,
  60,
  80,
  100,
  120,
  150,
  200,
];

export const SYSTEM_VOLTAGES = [12, 24, 48];

export const SURGE_KEYWORDS = [
  "frigo",
  "réfrig",
  "refrig",
  "clim",
  "climat",
  "air",
];

export const roundUpToStep = (value: number, step: number) => {
  if (step <= 0) return value;
  return Math.ceil(value / step) * step;
};

export const clampMin = (value: number, min: number) =>
  value < min ? min : value;

export const computeEnergyLoad = (equipments: Equipment[]): EnergyLoadResult => {
  const entries = equipments
    .filter((equipment) => equipment.include)
    .map((equipment) => ({
      id: equipment.id,
      name: equipment.name,
      energyWh: equipment.powerW * equipment.hoursPerDay * equipment.quantity,
    }));

  const totalWh = entries.reduce((total, entry) => total + entry.energyWh, 0);

  return { totalWh, entries };
};

export const computePowerTotal = (equipments: Equipment[]): PowerTotalResult => {
  const totalW = equipments
    .filter((equipment) => equipment.include)
    .reduce(
      (total, equipment) => total + equipment.powerW * equipment.quantity,
      0,
    );

  return { totalW };
};

export const computeEnergyProduced = (
  energyLoadWh: number,
  losses: LossesConfig,
) => {
  if (losses.mode === "simple") {
    return energyLoadWh * (1 + losses.marginPercent / 100);
  }

  const inverterEfficiency = losses.inverterEfficiency / 100;
  const controllerEfficiency = losses.controllerEfficiency / 100;
  const cableLoss = losses.cableLossPercent / 100;
  const tempLoss = losses.tempLossPercent / 100;

  return (
    energyLoadWh /
    (inverterEfficiency *
      controllerEfficiency *
      (1 - cableLoss) *
      (1 - tempLoss))
  );
};

export const computeBatteryBank = (
  energyProducedWh: number,
  autonomyDays: number,
  systemVoltage: number,
  depthOfDischargePercent: number,
): BatteryBankResult => {
  const depth = depthOfDischargePercent / 100;
  const rawAh =
    (energyProducedWh * autonomyDays) / (systemVoltage * depth);
  const requiredAh = roundUpToStep(rawAh, 10);

  return { requiredAh };
};

export const computeSeriesParallel = (
  systemVoltage: number,
  batteryVoltage: number,
  requiredAh: number,
  batteryCapacityAh: number,
): SeriesParallelResult => {
  if (batteryVoltage <= 0 || systemVoltage % batteryVoltage !== 0) {
    return { isCompatible: false };
  }

  const seriesCount = systemVoltage / batteryVoltage;
  const parallelCount = Math.ceil(requiredAh / batteryCapacityAh);
  const totalBatteries = seriesCount * parallelCount;

  return { isCompatible: true, seriesCount, parallelCount, totalBatteries };
};

export const computePV = (
  energyProducedWh: number,
  psh: number,
  oversizePercent: number,
  modulePowerWp: number,
): PVResult => {
  const pvPowerWp =
    psh > 0
      ? (energyProducedWh / psh) * (1 + oversizePercent / 100)
      : 0;
  const moduleCount = modulePowerWp > 0 ? Math.ceil(pvPowerWp / modulePowerWp) : 0;
  const installedPowerWp = moduleCount * modulePowerWp;

  return { pvPowerWp, moduleCount, installedPowerWp };
};

export const chooseStandardCurrent = (currentA: number) => {
  const match = STANDARD_CONTROLLER_CURRENTS.find(
    (standard) => currentA <= standard,
  );
  return match ?? STANDARD_CONTROLLER_CURRENTS.at(-1) ?? currentA;
};

export const computeController = (
  installedPowerWp: number,
  systemVoltage: number,
): ControllerResult => {
  const currentA = systemVoltage > 0 ? installedPowerWp / systemVoltage : 0;
  const recommendedCurrentA = currentA * 1.25;
  const standardCurrentA = chooseStandardCurrent(recommendedCurrentA);

  return { currentA, recommendedCurrentA, standardCurrentA };
};

const isSurgeTarget = (equipment: Equipment) => {
  const name = equipment.name.toLowerCase();
  return SURGE_KEYWORDS.some((keyword) => name.includes(keyword));
};

export const computeInverter = (
  totalPowerW: number,
  marginPercent: number,
  surgeEnabled: boolean,
  equipments: Equipment[],
): InverterResult => {
  const basePowerW = totalPowerW * (1 + marginPercent / 100);
  const surgePowerW = surgeEnabled
    ? equipments
        .filter((equipment) => equipment.include)
        .reduce((total, equipment) => {
          const factor = isSurgeTarget(equipment) ? 2 : 1;
          return total + equipment.powerW * equipment.quantity * factor;
        }, 0)
    : 0;

  const recommendedPowerW = surgeEnabled
    ? Math.max(basePowerW, surgePowerW)
    : basePowerW;

  return { recommendedPowerW, basePowerW, surgePowerW };
};

export const getSystemVoltageAuto = (totalPowerW: number) => {
  if (totalPowerW <= 1000) return 12;
  if (totalPowerW <= 2000) return 24;
  return 48;
};

export const isManualVoltageLow = (
  totalPowerW: number,
  manualVoltage: number,
) => {
  const recommended = getSystemVoltageAuto(totalPowerW);
  return manualVoltage < recommended;
};

export const getCompatibleSystemVoltages = (batteryVoltage: number) =>
  SYSTEM_VOLTAGES.filter((voltage) => voltage % batteryVoltage === 0);
