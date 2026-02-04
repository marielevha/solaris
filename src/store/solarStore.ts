import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import {
  BatteryConfig,
  ControllerConfig,
  Equipment,
  InverterConfig,
  LossesConfig,
  PVConfig,
  VoltageMode,
} from "../domain/types";

export interface SolarState {
  psh: number;
  equipments: Equipment[];
  losses: LossesConfig;
  voltageMode: VoltageMode;
  manualVoltage: number;
  battery: BatteryConfig;
  pv: PVConfig;
  controller: ControllerConfig;
  inverter: InverterConfig;
}

export interface SolarStore extends SolarState {
  setPsh: (psh: number) => void;
  setLosses: (losses: LossesConfig) => void;
  setVoltageMode: (mode: VoltageMode) => void;
  setManualVoltage: (voltage: number) => void;
  setBattery: (battery: BatteryConfig) => void;
  setPv: (pv: PVConfig) => void;
  setController: (controller: ControllerConfig) => void;
  setInverter: (inverter: InverterConfig) => void;
  addEquipment: () => void;
  updateEquipment: (id: string, patch: Partial<Equipment>) => void;
  removeEquipment: (id: string) => void;
  duplicateEquipment: (id: string) => void;
  setEquipments: (equipments: Equipment[]) => void;
  resetAll: () => void;
}

export const defaultEquipments = (): Equipment[] => [
  {
    id: nanoid(),
    name: "",
    powerW: 0,
    hoursPerDay: 0,
    quantity: 1,
    type: "continu",
    include: true,
  },
];

export const exampleEquipments = (): Equipment[] => [
  {
    id: nanoid(),
    name: "Réfrigérateur",
    powerW: 300,
    hoursPerDay: 24,
    quantity: 1,
    type: "continu",
    include: true,
  },
  {
    id: nanoid(),
    name: "Climatisation",
    powerW: 1200,
    hoursPerDay: 6,
    quantity: 1,
    type: "intermittent",
    include: true,
  },
  {
    id: nanoid(),
    name: "Lave-linge",
    powerW: 500,
    hoursPerDay: 0.5,
    quantity: 1,
    type: "intermittent",
    include: true,
  },
  {
    id: nanoid(),
    name: "TV",
    powerW: 170,
    hoursPerDay: 3,
    quantity: 1,
    type: "intermittent",
    include: true,
  },
  {
    id: nanoid(),
    name: "PC",
    powerW: 70,
    hoursPerDay: 4,
    quantity: 1,
    type: "intermittent",
    include: true,
  },
  {
    id: nanoid(),
    name: "Éclairage",
    powerW: 60,
    hoursPerDay: 3,
    quantity: 1,
    type: "continu",
    include: true,
  },
];

const defaultState: SolarState = {
  psh: 5,
  equipments: defaultEquipments(),
  losses: { mode: "simple", marginPercent: 25 },
  voltageMode: "auto",
  manualVoltage: 24,
  battery: {
    autonomyDays: 1,
    depthOfDischargePercent: 80,
    batteryVoltage: 12,
    batteryCapacityAh: 250,
    batteryType: "AGM",
  },
  pv: {
    modulePowerWp: 450,
    oversizePercent: 10,
  },
  controller: {
    type: "MPPT",
  },
  inverter: {
    marginPercent: 25,
    surgeEnabled: true,
  },
};

export const useSolarStore = create<SolarStore>()(
  persist(
    (set) => ({
      ...defaultState,
      setPsh: (psh) => set({ psh }),
      setLosses: (losses) => set({ losses }),
      setVoltageMode: (voltageMode) => set({ voltageMode }),
      setManualVoltage: (manualVoltage) => set({ manualVoltage }),
      setBattery: (battery) => set({ battery }),
      setPv: (pv) => set({ pv }),
      setController: (controller) => set({ controller }),
      setInverter: (inverter) => set({ inverter }),
      addEquipment: () =>
        set((state) => ({
          equipments: [
            ...state.equipments,
            {
              id: nanoid(),
              name: "",
              powerW: 0,
              hoursPerDay: 0,
              quantity: 1,
              type: "continu",
              include: true,
            },
          ],
        })),
      updateEquipment: (id, patch) =>
        set((state) => ({
          equipments: state.equipments.map((equipment) =>
            equipment.id === id ? { ...equipment, ...patch } : equipment,
          ),
        })),
      removeEquipment: (id) =>
        set((state) => ({
          equipments: state.equipments.filter((equipment) => equipment.id !== id),
        })),
      duplicateEquipment: (id) =>
        set((state) => {
          const equipment = state.equipments.find((item) => item.id === id);
          if (!equipment) return state;
          return {
            equipments: [
              ...state.equipments,
              { ...equipment, id: nanoid(), name: `${equipment.name} (copie)` },
            ],
          };
        }),
      setEquipments: (equipments) => set({ equipments }),
      resetAll: () =>
        set({
          ...defaultState,
          equipments: defaultEquipments(),
        }),
    }),
    {
      name: "solaris-storage",
      partialize: (state) => ({
        psh: state.psh,
        equipments: state.equipments,
        losses: state.losses,
        voltageMode: state.voltageMode,
        manualVoltage: state.manualVoltage,
        battery: state.battery,
        pv: state.pv,
        controller: state.controller,
        inverter: state.inverter,
      }),
      skipHydration: true,
    },
  ),
);
