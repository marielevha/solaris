"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  computeBatteryBank,
  computeController,
  computeEnergyLoad,
  computeEnergyProduced,
  computeInverter,
  computePowerTotal,
  computePV,
  computeSeriesParallel,
  getCompatibleSystemVoltages,
  getSystemVoltageAuto,
  isManualVoltageLow,
  SYSTEM_VOLTAGES,
} from "@/domain/calculations";
import {
  BatteryConfig,
  Equipment,
  LossesConfig,
  LossesMode,
  VoltageMode,
} from "@/domain/types";
import {
  defaultEquipments,
  exampleEquipments,
  useSolarStore,
} from "@/store/solarStore";

const numberFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 1,
});

const formatNumber = (value: number) => numberFormatter.format(value);

const formatEnergy = (valueWh: number) => ({
  wh: formatNumber(valueWh),
  kwh: formatNumber(valueWh / 1000),
});

const clampNumber = (value: number, min: number, max?: number) => {
  if (Number.isNaN(value)) return min;
  if (typeof max === "number" && value > max) return max;
  return value < min ? min : value;
};

const pshSchema = z.number().positive();

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const InfoBubble = ({ label }: { label: string }) => (
  <span
    className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500"
    title={label}
    aria-label={label}
  >
    ?
  </span>
);

const CopyIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="9" y="9" width="10" height="10" rx="2" />
    <rect x="5" y="5" width="10" height="10" rx="2" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export default function Home() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const {
    psh,
    equipments,
    losses,
    voltageMode,
    manualVoltage,
    battery,
    pv,
    controller,
    inverter,
    setPsh,
    setLosses,
    setVoltageMode,
    setManualVoltage,
    setBattery,
    setPv,
    setController,
    setInverter,
    addEquipment,
    updateEquipment,
    removeEquipment,
    duplicateEquipment,
    setEquipments,
    resetAll,
  } = useSolarStore();

  useEffect(() => {
    useSolarStore.persist.rehydrate();
    setHasHydrated(true);
  }, []);


  const energyLoad = useMemo(() => computeEnergyLoad(equipments), [equipments]);
  const powerTotal = useMemo(() => computePowerTotal(equipments), [equipments]);
  const autoVoltage = useMemo(
    () => getSystemVoltageAuto(powerTotal.totalW),
    [powerTotal.totalW],
  );
  const systemVoltage = voltageMode === "auto" ? autoVoltage : manualVoltage;
  const energyProduced = useMemo(
    () => computeEnergyProduced(energyLoad.totalWh, losses),
    [energyLoad.totalWh, losses],
  );
  const batteryBank = useMemo(
    () =>
      computeBatteryBank(
        energyProduced,
        battery.autonomyDays,
        systemVoltage,
        battery.depthOfDischargePercent,
      ),
    [
      battery.autonomyDays,
      battery.depthOfDischargePercent,
      energyProduced,
      systemVoltage,
    ],
  );
  const seriesParallel = useMemo(
    () =>
      computeSeriesParallel(
        systemVoltage,
        battery.batteryVoltage,
        batteryBank.requiredAh,
        battery.batteryCapacityAh,
      ),
    [
      battery.batteryCapacityAh,
      battery.batteryVoltage,
      batteryBank.requiredAh,
      systemVoltage,
    ],
  );
  const pvSizing = useMemo(
    () =>
      computePV(
        energyProduced,
        psh,
        pv.oversizePercent,
        pv.modulePowerWp,
      ),
    [energyProduced, psh, pv.modulePowerWp, pv.oversizePercent],
  );
  const controllerSizing = useMemo(
    () => computeController(pvSizing.installedPowerWp, systemVoltage),
    [pvSizing.installedPowerWp, systemVoltage],
  );
  const inverterSizing = useMemo(
    () =>
      computeInverter(
        powerTotal.totalW,
        inverter.marginPercent,
        inverter.surgeEnabled,
        equipments,
      ),
    [equipments, inverter.marginPercent, inverter.surgeEnabled, powerTotal.totalW],
  );

  const energyLoadDisplay = formatEnergy(energyLoad.totalWh);
  const energyProducedDisplay = formatEnergy(energyProduced);
  const hasResults = energyLoad.totalWh > 0;
  const voltageWarning =
    voltageMode === "manual" &&
    isManualVoltageLow(powerTotal.totalW, manualVoltage);
  const compatibleVoltages = getCompatibleSystemVoltages(
    battery.batteryVoltage,
  );
  const isBatteryCompatible = seriesParallel.isCompatible;

  const handleLossesModeChange = (mode: LossesMode) => {
    if (mode === "simple") {
      setLosses({
        mode: "simple",
        marginPercent:
          losses.mode === "simple" ? losses.marginPercent : 25,
      });
    } else {
      setLosses({
        mode: "advanced",
        inverterEfficiency:
          losses.mode === "advanced" ? losses.inverterEfficiency : 92,
        controllerEfficiency:
          losses.mode === "advanced" ? losses.controllerEfficiency : 98,
        cableLossPercent:
          losses.mode === "advanced" ? losses.cableLossPercent : 3,
        tempLossPercent:
          losses.mode === "advanced" ? losses.tempLossPercent : 7,
      });
    }
  };

  const summaryText = () => {
    const lines = [
      `Énergie consommée: ${energyLoadDisplay.wh} Wh/j (${energyLoadDisplay.kwh} kWh/j)`,
      `Énergie à produire: ${energyProducedDisplay.wh} Wh/j (${energyProducedDisplay.kwh} kWh/j)`,
      `Puissance totale: ${formatNumber(powerTotal.totalW)} W`,
      `Tension système: ${systemVoltage} V`,
      `Batteries: ${formatNumber(batteryBank.requiredAh)} Ah`,
      isBatteryCompatible
        ? `Batteries: ${seriesParallel.seriesCount} en série x ${seriesParallel.parallelCount} en parallèle = ${seriesParallel.totalBatteries} batteries`
        : "Batteries: tension incompatible",
      `PV requis: ${formatNumber(pvSizing.pvPowerWp)} Wp`,
      `Modules: ${pvSizing.moduleCount} x ${pv.modulePowerWp} Wp = ${formatNumber(
        pvSizing.installedPowerWp,
      )} Wp`,
      `Régulateur: ${controller.type} ${formatNumber(
        controllerSizing.recommendedCurrentA,
      )} A → palier ${controllerSizing.standardCurrentA} A`,
      `Onduleur: ${formatNumber(inverterSizing.recommendedPowerW)} W (pur sinus recommandé)`,
    ];

    return lines.join("\n");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summaryText());
  };

  const handleReset = () => {
    resetAll();
    useSolarStore.persist.clearStorage();
    setEquipments(defaultEquipments());
  };

  const handleEquipmentChange = (
    id: string,
    key: keyof Equipment,
    value: string | number | boolean,
  ) => {
    if (key === "name" || key === "type" || key === "include") {
      updateEquipment(id, { [key]: value } as Partial<Equipment>);
      return;
    }

    const numberValue = (() => {
      if (typeof value === "number") return value;
      if (typeof value === "string") return toNumber(value);
      return 0;
    })();
    const sanitized = (() => {
      switch (key) {
        case "powerW":
          return clampNumber(numberValue, 0);
        case "hoursPerDay":
          return clampNumber(numberValue, 0, 24);
        case "quantity":
          return clampNumber(Math.round(numberValue), 1);
        default:
          return numberValue;
      }
    })();

    updateEquipment(id, { [key]: sanitized } as Partial<Equipment>);
  };

  const renderLossesFields = (lossesConfig: LossesConfig) => {
    if (lossesConfig.mode === "simple") {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            <span className="inline-flex items-center gap-2">
              Marge pertes (%)
              <InfoBubble label="Ajout forfaitaire pour couvrir les pertes globales." />
            </span>
            <input
              type="number"
              min={10}
              max={40}
              value={lossesConfig.marginPercent}
              onChange={(event) =>
                setLosses({
                  mode: "simple",
                  marginPercent: clampNumber(toNumber(event.target.value), 10, 40),
                })
              }
              className="input"
            />
            <span className="text-xs text-slate-500">Défaut 25%</span>
          </label>
        </div>
      );
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          <span className="inline-flex items-center gap-2">
            Rendement onduleur (%)
            <InfoBubble label="Efficacité moyenne de l'onduleur." />
          </span>
          <input
            type="number"
            min={0}
            max={100}
            value={lossesConfig.inverterEfficiency}
            onChange={(event) =>
              setLosses({
                ...lossesConfig,
                inverterEfficiency: clampNumber(
                  toNumber(event.target.value),
                  0,
                  100,
                ),
              })
            }
            className="input"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          <span className="inline-flex items-center gap-2">
            Rendement régulateur (%)
            <InfoBubble label="Efficacité moyenne du régulateur." />
          </span>
          <input
            type="number"
            min={0}
            max={100}
            value={lossesConfig.controllerEfficiency}
            onChange={(event) =>
              setLosses({
                ...lossesConfig,
                controllerEfficiency: clampNumber(
                  toNumber(event.target.value),
                  0,
                  100,
                ),
              })
            }
            className="input"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          <span className="inline-flex items-center gap-2">
            Pertes câbles (%)
            <InfoBubble label="Pertes estimées dans les câbles." />
          </span>
          <input
            type="number"
            min={0}
            max={100}
            value={lossesConfig.cableLossPercent}
            onChange={(event) =>
              setLosses({
                ...lossesConfig,
                cableLossPercent: clampNumber(
                  toNumber(event.target.value),
                  0,
                  100,
                ),
              })
            }
            className="input"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          <span className="inline-flex items-center gap-2">
            Pertes température (%)
            <InfoBubble label="Pertes dues à la température des modules." />
          </span>
          <input
            type="number"
            min={0}
            max={100}
            value={lossesConfig.tempLossPercent}
            onChange={(event) =>
              setLosses({
                ...lossesConfig,
                tempLossPercent: clampNumber(
                  toNumber(event.target.value),
                  0,
                  100,
                ),
              })
            }
            className="input"
          />
        </label>
      </div>
    );
  };

  const renderEquipmentRow = (equipment: Equipment) => (
    <tr key={equipment.id} className="border-b border-slate-100">
      <td className="p-2">
        <input
          type="text"
          value={equipment.name}
          onChange={(event) =>
            handleEquipmentChange(equipment.id, "name", event.target.value)
          }
          className="input w-full"
          placeholder="Ex: Réfrigérateur"
        />
      </td>
      <td className="p-2">
        <input
          type="number"
          min={0}
          value={equipment.powerW}
          onChange={(event) =>
            handleEquipmentChange(equipment.id, "powerW", event.target.value)
          }
          className="input w-full"
        />
      </td>
      <td className="p-2">
        <input
          type="number"
          min={0}
          max={24}
          value={equipment.hoursPerDay}
          onChange={(event) =>
            handleEquipmentChange(equipment.id, "hoursPerDay", event.target.value)
          }
          className="input w-full"
        />
      </td>
      <td className="p-2">
        <input
          type="number"
          min={1}
          value={equipment.quantity}
          onChange={(event) =>
            handleEquipmentChange(equipment.id, "quantity", event.target.value)
          }
          className="input w-full"
        />
      </td>
      <td className="p-2">
        <select
          value={equipment.type}
          onChange={(event) =>
            handleEquipmentChange(equipment.id, "type", event.target.value)
          }
          className="input w-full"
        >
          <option value="continu">Continu</option>
          <option value="intermittent">Intermittent</option>
        </select>
      </td>
      <td className="p-2 text-center">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={equipment.include}
            onChange={(event) =>
              handleEquipmentChange(equipment.id, "include", event.target.checked)
            }
            className="h-4 w-4 accent-slate-900"
          />
          <span className="sr-only">Inclure</span>
        </label>
      </td>
      <td className="p-2 text-right">
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => duplicateEquipment(equipment.id)}
            className="btn-secondary inline-flex h-9 w-9 items-center justify-center"
            title="Dupliquer"
            aria-label="Dupliquer"
          >
            <CopyIcon className="h-4 w-4" />
            <span className="sr-only">Dupliquer</span>
          </button>
          <button
            type="button"
            onClick={() => removeEquipment(equipment.id)}
            className="btn-secondary inline-flex h-9 w-9 items-center justify-center text-rose-600"
            title="Supprimer"
            aria-label="Supprimer"
          >
            <TrashIcon className="h-4 w-4" />
            <span className="sr-only">Supprimer</span>
          </button>
        </div>
      </td>
    </tr>
  );

  const isPshValid = pshSchema.safeParse(psh).success;
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Chargement des données…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Dimensionnement
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Dimensionnement solaire résidentiel
          </h1>
          <p className="max-w-2xl text-sm text-slate-600">
            Entrez vos équipements et paramètres de site. Les résultats se
            mettent à jour instantanément avec les formules du cahier des
            charges.
          </p>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6 print:hidden">
          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Région & solaire</h2>
            </div>
            <div className="card-body grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex items-center gap-2">
                  PSH (h/j)
                  <InfoBubble label="PSH = Peak Sun Hours : nombre d'heures d'ensoleillement équivalent par jour." />
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={psh}
                    onChange={(event) =>
                      setPsh(clampNumber(toNumber(event.target.value), 0.1))
                    }
                    className="input w-full"
                  />
                </div>
                {!isPshValid && (
                  <span className="text-xs text-rose-600">
                    La PSH doit être strictement supérieure à 0.
                  </span>
                )}
              </label>
            </div>
          </section>

          <section className="card">
            <div className="card-header flex flex-wrap items-center justify-between gap-3">
              <h2 className="card-title">Équipements</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEquipments(exampleEquipments())}
                  className="btn-secondary"
                >
                  Préremplir exemple
                </button>
                <button
                  type="button"
                  onClick={addEquipment}
                  className="btn-primary"
                >
                  Ajouter une ligne
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="min-w-[720px] w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="p-2">
                        <span className="inline-flex items-center gap-2">
                          Nom
                          <InfoBubble label="Nom descriptif de l'équipement." />
                        </span>
                      </th>
                      <th className="p-2">
                        <span className="inline-flex items-center gap-2">
                          Puissance (W)
                          <InfoBubble label="Puissance nominale en watts." />
                        </span>
                      </th>
                      <th className="p-2">
                        <span className="inline-flex items-center gap-2">
                          Durée (h/j)
                          <InfoBubble label="Nombre d'heures d'utilisation par jour." />
                        </span>
                      </th>
                      <th className="p-2">
                        <span className="inline-flex items-center gap-2">
                          Qté
                          <InfoBubble label="Quantité d'appareils identiques." />
                        </span>
                      </th>
                      <th className="p-2">
                        <span className="inline-flex items-center gap-2">
                          Type
                          <InfoBubble label="Continu = usage permanent, Intermittent = usage ponctuel." />
                        </span>
                      </th>
                      <th className="p-2 text-center">
                        <span className="inline-flex items-center gap-2">
                          Inclure
                          <InfoBubble label="Inclure l'équipement dans les calculs." />
                        </span>
                      </th>
                      <th className="p-2 text-right">
                        <span className="inline-flex items-center gap-2">
                          Actions
                          <InfoBubble label="Dupliquer ou supprimer la ligne." />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>{equipments.map(renderEquipmentRow)}</tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="card-title">Pertes & rendements</h2>
                <p className="text-xs text-slate-500">
                  Mode simple ou détaillé selon vos données techniques.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={losses.mode === "simple" ? "font-semibold" : "text-slate-500"}>
                  Simple
                </span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={losses.mode === "advanced"}
                    onChange={(event) =>
                      handleLossesModeChange(
                        event.target.checked ? "advanced" : "simple",
                      )
                    }
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-emerald-500 peer-checked:after:translate-x-full"></div>
                </label>
                <span className={losses.mode === "advanced" ? "font-semibold" : "text-slate-500"}>
                  Avancé
                </span>
              </div>
            </div>
            <div className="card-body">{renderLossesFields(losses)}</div>
          </section>

          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Tension système</h2>
            </div>
            <div className="card-body grid gap-4">
              <div className="flex items-center gap-3 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="voltageMode"
                    checked={voltageMode === "auto"}
                    onChange={() => setVoltageMode("auto")}
                  />
                  Auto (recommandé)
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="voltageMode"
                    checked={voltageMode === "manual"}
                    onChange={() => setVoltageMode("manual")}
                  />
                  Manuel
                </label>
              </div>
              {voltageMode === "auto" ? (
                <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                  Tension automatique estimée : {autoVoltage} V
                </div>
              ) : (
                <div className="grid gap-2">
                  <div className="flex flex-wrap gap-3">
                    {SYSTEM_VOLTAGES.map((voltage) => (
                      <label
                        key={voltage}
                        className="inline-flex items-center gap-2 text-sm"
                      >
                        <input
                          type="radio"
                          name="manualVoltage"
                          checked={manualVoltage === voltage}
                          onChange={() => setManualVoltage(voltage)}
                        />
                        {voltage} V
                      </label>
                    ))}
                  </div>
                  {voltageWarning && (
                    <p className="text-xs text-amber-600">
                      Cette tension semble faible pour la puissance totale. En
                      auto, la recommandation est {autoVoltage} V.
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Batteries</h2>
            </div>
            <div className="card-body grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex items-center gap-2">
                  Autonomie (jours)
                  <InfoBubble label="Nombre de jours d'autonomie souhaités." />
                </span>
                <input
                  type="number"
                  min={1}
                  value={battery.autonomyDays}
                  onChange={(event) =>
                    setBattery({
                      ...battery,
                      autonomyDays: clampNumber(toNumber(event.target.value), 1),
                    })
                  }
                  className="input"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex items-center gap-2">
                  Profondeur décharge (%)
                  <InfoBubble label="Pourcentage de décharge maximale des batteries." />
                </span>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={battery.depthOfDischargePercent}
                  onChange={(event) =>
                    setBattery({
                      ...battery,
                      depthOfDischargePercent: clampNumber(
                        toNumber(event.target.value),
                        10,
                        100,
                      ),
                    })
                  }
                  className="input"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex items-center gap-2">
                  Tension batterie unitaire (V)
                  <InfoBubble label="Tension nominale d'une batterie individuelle." />
                </span>
                <select
                  value={battery.batteryVoltage}
                  onChange={(event) =>
                    setBattery({
                      ...battery,
                      batteryVoltage: toNumber(event.target.value),
                    })
                  }
                  className="input"
                >
                  {SYSTEM_VOLTAGES.map((voltage) => (
                    <option key={voltage} value={voltage}>
                      {voltage} V
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex items-center gap-2">
                  Capacité batterie unitaire (Ah)
                  <InfoBubble label="Capacité d'une batterie en ampères-heures." />
                </span>
                <input
                  type="number"
                  min={1}
                  value={battery.batteryCapacityAh}
                  onChange={(event) =>
                    setBattery({
                      ...battery,
                      batteryCapacityAh: clampNumber(
                        toNumber(event.target.value),
                        1,
                      ),
                    })
                  }
                  className="input"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex items-center gap-2">
                  Type de batterie
                  <InfoBubble label="Technologie de batterie utilisée." />
                </span>
                <select
                  value={battery.batteryType}
                  onChange={(event) =>
                    setBattery({
                      ...battery,
                      batteryType: event.target.value as BatteryConfig["batteryType"],
                    })
                  }
                  className="input"
                >
                  <option value="AGM">AGM</option>
                  <option value="GEL">GEL</option>
                  <option value="LiFePO4">LiFePO4</option>
                </select>
              </label>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <h2 className="card-title">Panneaux, régulateur & onduleur</h2>
            </div>
            <div className="card-body grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex items-center gap-2">
                  Puissance module (Wp)
                  <InfoBubble label="Puissance crête d'un module photovoltaïque." />
                </span>
                <input
                  type="number"
                  min={1}
                  value={pv.modulePowerWp}
                  onChange={(event) =>
                    setPv({
                      ...pv,
                      modulePowerWp: clampNumber(toNumber(event.target.value), 1),
                    })
                  }
                  className="input"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex items-center gap-2">
                  Oversize PV (%)
                  <InfoBubble label="Surdimensionnement pour couvrir les pertes et variations." />
                </span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={pv.oversizePercent}
                  onChange={(event) =>
                    setPv({
                      ...pv,
                      oversizePercent: clampNumber(
                        toNumber(event.target.value),
                        0,
                        20,
                      ),
                    })
                  }
                  className="input"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex items-center gap-2">
                  Type régulateur
                  <InfoBubble label="Type de contrôleur de charge (MPPT/PWM)." />
                </span>
                <select
                  value={controller.type}
                  onChange={(event) =>
                    setController({ type: event.target.value as "PWM" | "MPPT" })
                  }
                  className="input"
                >
                  <option value="MPPT">MPPT</option>
                  <option value="PWM">PWM</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                <span className="inline-flex items-center gap-2">
                  Marge onduleur (%)
                  <InfoBubble label="Marge de sécurité sur la puissance de l'onduleur." />
                </span>
                <input
                  type="number"
                  min={0}
                  value={inverter.marginPercent}
                  onChange={(event) =>
                    setInverter({
                      ...inverter,
                      marginPercent: clampNumber(toNumber(event.target.value), 0),
                    })
                  }
                  className="input"
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={inverter.surgeEnabled}
                  onChange={(event) =>
                    setInverter({
                      ...inverter,
                      surgeEnabled: event.target.checked,
                    })
                  }
                />
                <span className="inline-flex items-center gap-2">
                  Option "Surge" (frigo, clim)
                  <InfoBubble label="Active la prise en compte des appels de courant au démarrage." />
                </span>
              </label>
            </div>
          </section>

        </div>

        <aside className="flex h-fit flex-col gap-6 lg:sticky lg:top-6">
          {hasResults && (
            <section className="card border-slate-200 bg-white">
              <div className="card-header">
                <h2 className="card-title">Actions</h2>
              </div>
              <div className="card-body flex flex-wrap justify-end gap-3">
                <button type="button" onClick={handleCopy} className="btn-primary">
                  Copier le résumé
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-secondary"
                >
                  Exporter (imprimer)
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-secondary text-rose-600"
                >
                  Reset
                </button>
              </div>
            </section>
          )}
          <section className="card border-emerald-100 bg-white">
            <div className="card-header border-b border-emerald-100">
              <h2 className="card-title">Résultats</h2>
              <p className="text-xs text-slate-500">
                Calculs mis à jour en temps réel.
              </p>
            </div>
            <div className="card-body flex flex-col gap-4">
              <div className="grid gap-3">
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
                    {formatNumber(powerTotal.totalW)} W
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Tension système</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {systemVoltage} V
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-700">Batteries</h3>
                <p className="text-lg font-semibold text-slate-900">
                  {formatNumber(batteryBank.requiredAh)} Ah
                </p>
                {isBatteryCompatible ? (
                  <p className="text-xs text-slate-600">
                    {seriesParallel.seriesCount} en série ×{" "}
                    {seriesParallel.parallelCount} en parallèle ={" "}
                    {seriesParallel.totalBatteries} batteries
                  </p>
                ) : (
                  <p className="text-xs text-rose-600">
                    La tension système ({systemVoltage} V) doit être un multiple de{" "}
                    {battery.batteryVoltage} V. Suggestions :{" "}
                    {compatibleVoltages.join(" / ")} V.
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-700">Panneaux PV</h3>
                <p className="text-lg font-semibold text-slate-900">
                  {formatNumber(pvSizing.pvPowerWp)} Wp
                </p>
                <p className="text-xs text-slate-600">
                  {pvSizing.moduleCount} modules × {pv.modulePowerWp} Wp ={" "}
                  {formatNumber(pvSizing.installedPowerWp)} Wp installés
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-700">Régulateur</h3>
                <p className="text-lg font-semibold text-slate-900">
                  {controller.type} ·{" "}
                  {formatNumber(controllerSizing.recommendedCurrentA)} A
                </p>
                <p className="text-xs text-slate-600">
                  Palier recommandé : {controllerSizing.standardCurrentA} A
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-700">Onduleur</h3>
                <p className="text-lg font-semibold text-slate-900">
                  {formatNumber(inverterSizing.recommendedPowerW)} W
                </p>
                <p className="text-xs text-slate-600">Pur sinus recommandé.</p>
              </div>

              <details className="rounded-lg border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                  Détails des calculs
                </summary>
                <div className="mt-3 space-y-3 text-xs text-slate-600">
                  <div>
                    <p className="font-semibold">Énergie consommée</p>
                    <p>E = Σ(P × h × Qté) = {energyLoadDisplay.wh} Wh/j</p>
                  </div>
                  <div>
                    <p className="font-semibold">Énergie à produire</p>
                    {losses.mode === "simple" ? (
                      <p>
                        E_prod = E_load × (1 + pertes%) ={" "}
                        {energyProducedDisplay.wh} Wh/j
                      </p>
                    ) : (
                      <p>
                        E_prod = E_load / (η_inv × η_reg × (1 - L_cable) × (1 - L_temp))
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">Batteries</p>
                    <p>
                      C_bank = (E_prod × Autonomie) / (V_sys × DoD)
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">PV</p>
                    <p>
                      P_pv = (E_prod / PSH) × (1 + oversize%) ={" "}
                      {formatNumber(pvSizing.pvPowerWp)} Wp
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Régulateur</p>
                    <p>
                      I = P_inst / V_sys × 1.25 ={" "}
                      {formatNumber(controllerSizing.recommendedCurrentA)} A
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Onduleur</p>
                    <p>
                      P_inv = max(P_total × (1 + marge), P_surge)
                    </p>
                  </div>
                </div>
              </details>
            </div>
          </section>
        </aside>
      </main>

      <section className="mx-auto w-full max-w-6xl px-6 pb-10 print:block print:px-0">
        <div className="hidden print:block">
          <h2 className="text-xl font-semibold text-slate-900">
            Tableau équipements
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
                {equipments
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
        </div>
      </section>
    </div>
  );
}
