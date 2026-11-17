// Luggage fees in pesewas. Demo values for development — confirm real fees with the operator.
export const LUGGAGE_FEES = { none: 0, standard: 1000, large: 2500 } as const;
export type Luggage = keyof typeof LUGGAGE_FEES;

export const LUGGAGE_LABELS: Record<Luggage, string> = {
  none: "Hand luggage only",
  standard: "One standard bag",
  large: "Large or extra bag",
};

export function quote(farePesewas: number, luggage: Luggage) {
  const luggagePesewas = LUGGAGE_FEES[luggage];
  return { farePesewas, luggagePesewas, amountPesewas: farePesewas + luggagePesewas, currency: "GHS" as const };
}
