/* ------------------------------------------------------------------
   Unit system. Measurements are stored canonically (temperature in °F,
   volume in US gallons) and converted only for display / input so the
   underlying data — charts, thresholds, health ranges — stays consistent
   regardless of the user's preference.
------------------------------------------------------------------- */

export type Units = "imperial" | "metric";

export const tempUnit = (u: Units) => (u === "metric" ? "°C" : "°F");
export const volUnit = (u: Units) => (u === "metric" ? "L" : "gal");

const round = (n: number, dp = 1) => {
  const f = Math.pow(10, dp);
  return Math.round(n * f) / f;
};

/** canonical °F -> displayed number */
export const toDisplayTemp = (f: number, u: Units) => (u === "metric" ? round(((f - 32) * 5) / 9) : round(f));
/** displayed number -> canonical °F */
export const fromDisplayTemp = (x: number, u: Units) => (u === "metric" ? (x * 9) / 5 + 32 : x);

/** canonical gallons -> displayed number */
export const toDisplayVol = (gal: number, u: Units) => (u === "metric" ? round(gal * 3.78541) : round(gal));
/** displayed number -> canonical gallons */
export const fromDisplayVol = (x: number, u: Units) => (u === "metric" ? x / 3.78541 : x);

export const fmtTemp = (f: number, u: Units) => `${toDisplayTemp(f, u)}${tempUnit(u)}`;
export const fmtVol = (gal: number, u: Units) => `${toDisplayVol(gal, u)} ${volUnit(u)}`;
