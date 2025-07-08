// src/hooks/useUnitConversion.ts
import { useMemo } from "react";
import { convertUnits, type Unit } from "@/utils/units";

export function useUnitConversion<T extends Record<string, any>>(
  rawData: T[] | null | undefined,
  unit: Unit
): T[] | null {
  return useMemo(() => {
    if (!rawData) return null;
    return convertUnits(rawData, unit);
  }, [rawData, unit]);
}
