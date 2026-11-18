// Luggage policy. Every ticket includes one 25 kg allowance; extra bags are paid per bag.
// Fees are demo values for development — confirm real fees with the operator.
// Stored values keep their original names: none = allowance only, standard = +1 extra bag, large = +2 extra bags.
export const LUGGAGE_POLICY = { includedKg: 25, marginKg: 3, extraBagKg: 25 } as const;

export const LUGGAGE_FEES = { none: 0, standard: 1500, large: 3000 } as const;
export type Luggage = keyof typeof LUGGAGE_FEES;
export const LUGGAGE_ORDER: Luggage[] = ["none", "standard", "large"];

export const LUGGAGE_LABELS: Record<Luggage, string> = {
  none: "25 kg included",
  standard: "25 kg included + 1 extra bag",
  large: "25 kg included + 2 extra bags",
};

export const LUGGAGE_DETAILS: Record<Luggage, string> = {
  none: "One main bag up to 25 kg, plus a small bag on your lap. Most students need nothing more.",
  standard: "Your 25 kg bag plus one more bag up to 25 kg, such as a second suitcase or a full travel bag.",
  large: "Your 25 kg bag plus two more bags up to 25 kg each, for moving out of halls or carrying boxes.",
};

export const luggageRank = (l: Luggage) => LUGGAGE_ORDER.indexOf(l);

export function quote(farePesewas: number, luggage: Luggage) {
  const luggagePesewas = LUGGAGE_FEES[luggage];
  return { farePesewas, luggagePesewas, amountPesewas: farePesewas + luggagePesewas, currency: "GHS" as const };
}
