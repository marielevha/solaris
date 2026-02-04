export type EquipmentType = "continu" | "intermittent";

export interface Equipment {
  id: string;
  name: string;
  powerW: number;
  hoursPerDay: number;
  quantity: number;
  type: EquipmentType;
  include: boolean;
}

export type LossesMode = "simple" | "advanced";

export interface LossesSimple {
  mode: "simple";
  marginPercent: number;
}

export interface LossesAdvanced {
  mode: "advanced";
  inverterEfficiency: number;
  controllerEfficiency: number;
  cableLossPercent: number;
  tempLossPercent: number;
}

export type LossesConfig = LossesSimple | LossesAdvanced;

export type VoltageMode = "auto" | "manual";

export type ControllerType = "PWM" | "MPPT";

export type BatteryType = "AGM" | "GEL" | "LiFePO4";

export interface BatteryConfig {
  autonomyDays: number;
  depthOfDischargePercent: number;
  batteryVoltage: number;
  batteryCapacityAh: number;
  batteryType: BatteryType;
}

export interface PVConfig {
  modulePowerWp: number;
  oversizePercent: number;
}

export interface ControllerConfig {
  type: ControllerType;
}

export interface InverterConfig {
  marginPercent: number;
  surgeEnabled: boolean;
}

export interface EnergyLoadResult {
  totalWh: number;
  entries: Array<{
    id: string;
    name: string;
    energyWh: number;
  }>;
}

export interface PowerTotalResult {
  totalW: number;
}

export interface BatteryBankResult {
  requiredAh: number;
}

export interface SeriesParallelResult {
  isCompatible: boolean;
  seriesCount?: number;
  parallelCount?: number;
  totalBatteries?: number;
}

export interface PVResult {
  pvPowerWp: number;
  moduleCount: number;
  installedPowerWp: number;
}

export interface ControllerResult {
  currentA: number;
  recommendedCurrentA: number;
  standardCurrentA: number;
}

export interface InverterResult {
  recommendedPowerW: number;
  basePowerW: number;
  surgePowerW: number;
}
