"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeBatteryBank,
  computeController,
  computeEnergyLoad,
  computeEnergyProduced,
  computeInverter,
  computePowerTotal,
  computePV,
  computeSeriesParallel,
  getSystemVoltageAuto,
} from "@/domain/calculations";
import type { SolarState } from "@/store/solarStore";
import { AdSlot } from "@/components/ads/AdSlot";

const numberFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 1,
});

const formatNumber = (value: number) => numberFormatter.format(value);

const formatEnergy = (valueWh: number) => ({
  wh: formatNumber(valueWh),
  kwh: formatNumber(valueWh / 1000),
});

export default function PrintPage() {
  const [state, setState] = useState<SolarState | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("solaris-storage");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { state?: SolarState };
      if (parsed.state) setState(parsed.state);
    } catch {
      setState(null);
    }
  }, []);

  const computed = useMemo(() => {
    if (!state) return null;
    const energyLoad = computeEnergyLoad(state.equipments);
    const powerTotal = computePowerTotal(state.equipments);
    const systemVoltage =
      state.voltageMode === "auto"
        ? getSystemVoltageAuto(powerTotal.totalW)
        : state.manualVoltage;
    const energyProduced = computeEnergyProduced(energyLoad.totalWh, state.losses);
    const batteryBank = computeBatteryBank(
      energyProduced,
      state.battery.autonomyDays,
      systemVoltage,
      state.battery.depthOfDischargePercent,
    );
    const seriesParallel = computeSeriesParallel(
      systemVoltage,
      state.battery.batteryVoltage,
      batteryBank.requiredAh,
      state.battery.batteryCapacityAh,
    );
    const pvSizing = computePV(
      energyProduced,
      state.psh,
      state.pv.oversizePercent,
      state.pv.modulePowerWp,
    );
    const controllerSizing = computeController(
      pvSizing.installedPowerWp,
      systemVoltage,
    );
    const inverterSizing = computeInverter(
      powerTotal.totalW,
      state.inverter.marginPercent,
      state.inverter.surgeEnabled,
      state.equipments,
    );

    return {
      energyLoad,
      powerTotal,
      systemVoltage,
      energyProduced,
      batteryBank,
      seriesParallel,
      pvSizing,
      controllerSizing,
      inverterSizing,
    };
  }, [state]);

  if (!state || !computed) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-600">
            Aucune donnée disponible pour l'impression. Revenez à l'application
            principale et relancez l'export.
          </p>
        </div>
      </div>
    );
  }

  const energyLoadDisplay = formatEnergy(computed.energyLoad.totalWh);
  const energyProducedDisplay = formatEnergy(computed.energyProduced);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 print:bg-white print:px-0">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm print:hidden">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Rapport d'installation solaire
            </h1>
            <p className="text-xs text-slate-500">
              Export imprimable depuis Solaris Congo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-primary"
          >
            Imprimer
          </button>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Synthèse</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-slate-400">Énergie consommée</p>
              <p className="text-lg font-semibold text-slate-900">
                {energyLoadDisplay.wh} Wh/j ({energyLoadDisplay.kwh} kWh/j)
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Énergie à produire</p>
              <p className="text-lg font-semibold text-slate-900">
                {energyProducedDisplay.wh} Wh/j ({energyProducedDisplay.kwh} kWh/j)
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Puissance totale</p>
              <p className="text-lg font-semibold text-slate-900">
                {formatNumber(computed.powerTotal.totalW)} W
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Tension système</p>
              <p className="text-lg font-semibold text-slate-900">
                {computed.systemVoltage} V
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Équipements retenus
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Nom</th>
                  <th className="py-2">Puissance</th>
                  <th className="py-2">Durée</th>
                  <th className="py-2">Qté</th>
                </tr>
              </thead>
              <tbody>
                {state.equipments
                  .filter((equipment) => equipment.include)
                  .map((equipment) => (
                    <tr key={equipment.id} className="border-b border-slate-100">
                      <td className="py-2">{equipment.name || "-"}</td>
                      <td className="py-2">{equipment.powerW} W</td>
                      <td className="py-2">{equipment.hoursPerDay} h/j</td>
                      <td className="py-2">{equipment.quantity}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Dimensionnement
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-slate-400">Batteries</p>
              <p className="font-semibold text-slate-900">
                {formatNumber(computed.batteryBank.requiredAh)} Ah
              </p>
              {computed.seriesParallel.isCompatible ? (
                <p className="text-xs text-slate-600">
                  {computed.seriesParallel.seriesCount} en série ×{" "}
                  {computed.seriesParallel.parallelCount} en parallèle ={" "}
                  {computed.seriesParallel.totalBatteries} batteries
                </p>
              ) : (
                <p className="text-xs text-rose-600">Tension incompatible</p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Panneaux PV</p>
              <p className="font-semibold text-slate-900">
                {formatNumber(computed.pvSizing.pvPowerWp)} Wp
              </p>
              <p className="text-xs text-slate-600">
                {computed.pvSizing.moduleCount} modules × {state.pv.modulePowerWp} Wp
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Régulateur</p>
              <p className="font-semibold text-slate-900">
                {state.controller.type} ·{" "}
                {formatNumber(computed.controllerSizing.recommendedCurrentA)} A
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Onduleur</p>
              <p className="font-semibold text-slate-900">
                {formatNumber(computed.inverterSizing.recommendedPowerW)} W
              </p>
            </div>
          </div>
        </section>

        <AdSlot placement="print" variant="full" />
      </div>
    </div>
  );
}
