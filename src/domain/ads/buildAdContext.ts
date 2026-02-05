import {
  computeEnergyLoad,
  computeEnergyProduced,
  computePowerTotal,
  computePV,
  getSystemVoltageAuto,
} from "@/domain/calculations";
import type {
  BatteryConfig,
  Equipment,
  LossesConfig,
  PVConfig,
  VoltageMode,
} from "@/domain/types";
import type { AdContext } from "@/types/ads";

export type AdContextInput = {
  psh: number;
  equipments: Equipment[];
  losses: LossesConfig;
  voltageMode: VoltageMode;
  manualVoltage: number;
  battery: BatteryConfig;
  pv: PVConfig;
};

export const buildAdContext = (input: AdContextInput): AdContext => {
  const energyLoad = computeEnergyLoad(input.equipments);
  const powerTotal = computePowerTotal(input.equipments);
  const systemVoltage =
    input.voltageMode === "auto"
      ? getSystemVoltageAuto(powerTotal.totalW)
      : input.manualVoltage;
  const energyProduced = computeEnergyProduced(energyLoad.totalWh, input.losses);
  const pvSizing = computePV(
    energyProduced,
    input.psh,
    input.pv.oversizePercent,
    input.pv.modulePowerWp,
  );
  const pvKw = pvSizing.installedPowerWp / 1000;

  return {
    pvKw,
    systemVoltage,
    batteryType: input.battery.batteryType,
  };
};
