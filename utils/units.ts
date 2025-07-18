// src/utils/unit.ts

export type Unit = "억" | "백만" | "천" | "원";

export const unitFactors: Record<Unit, number> = {
  억: 100_000_000,
  백만: 1_000_000,
  천: 1_000,
  원: 1,
};

/**
 * 숫자 필드(숫자 타입 프로퍼티)들만 골라서 단위를 변경해 줍니다.
 */
export function convertUnits<T extends Record<string, any>>(
  data: T[],
  unit: Unit
): T[] {
  const factor = unitFactors[unit] || 1;
  return data.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, val]) => [
        key,
        typeof val === "number" ? +(val / factor).toFixed(2) : val,
      ])
    )
  ) as T[];
}
