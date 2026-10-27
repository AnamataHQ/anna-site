// Sun position for the hero plates (design/hero/README.md: the window light
// follows the real sun). NOAA's low-precision algorithm, good to a fraction of
// a degree, which is far more than a cross-fade needs. No runtime imports, so
// the tests can load this file directly.

export const HERO_LOCATION = { latitude: 52.1, longitude: 5.3 } as const;

export type PlateWeights = {
  morning: number;
  midday: number;
  afternoon: number;
};

const RAD = Math.PI / 180;

function solarPosition(date: Date, latitude: number, longitude: number) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - start) / 86_400_000);
  const utcMinutes =
    date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const gamma =
    ((2 * Math.PI) / 365) * (dayOfYear + (utcMinutes / 60 - 12) / 24);
  const equationOfTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));
  const declination =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);
  const trueSolarMinutes = utcMinutes + equationOfTime + 4 * longitude;
  // Hour angle in degrees: negative before solar noon, positive after.
  let hourAngle = trueSolarMinutes / 4 - 180;
  if (hourAngle < -180) hourAngle += 360;
  if (hourAngle > 180) hourAngle -= 360;
  const cosZenith =
    Math.sin(latitude * RAD) * Math.sin(declination) +
    Math.cos(latitude * RAD) * Math.cos(declination) * Math.cos(hourAngle * RAD);
  const altitude = 90 - Math.acos(Math.max(-1, Math.min(1, cosZenith))) / RAD;
  const noonAltitude = 90 - Math.abs(latitude - declination / RAD);
  return { altitude, hourAngle, noonAltitude };
}

export function solarAltitude(
  date: Date,
  latitude = HERO_LOCATION.latitude,
  longitude = HERO_LOCATION.longitude,
): number {
  return solarPosition(date, latitude, longitude).altitude;
}

// Morning and afternoon plates carry the low sun; midday takes over as the sun
// climbs towards the day's own noon height, so a December noon is still midday.
// Below the horizon the last low-sun plate simply stays (there is no night
// plate): afternoon until solar midnight, morning after it.
export function plateWeights(
  date: Date,
  latitude = HERO_LOCATION.latitude,
  longitude = HERO_LOCATION.longitude,
): PlateWeights {
  const { altitude, hourAngle, noonAltitude } = solarPosition(
    date,
    latitude,
    longitude,
  );
  const climb = Math.max(0, Math.min(1, altitude / Math.max(noonAltitude, 1)));
  const midday = climb ** 1.5;
  const low = 1 - midday;
  return hourAngle < 0
    ? { morning: low, midday, afternoon: 0 }
    : { morning: 0, midday, afternoon: low };
}

// Plates are stacked morning, midday, afternoon and composited source-over, so
// the two upper opacities are derived from the weights and the morning plate
// stays opaque: the room never shows the wall colour through a half-faded
// plate. With weights (m, d, a): afternoon = a, midday = d / (1 - a).
export function plateOpacities(weights: PlateWeights) {
  const afternoon = Math.min(1, weights.afternoon);
  const midday =
    afternoon >= 1 ? 1 : Math.min(1, weights.midday / (1 - afternoon));
  return { morning: 1, midday, afternoon };
}

// The plate the sun favours right now; the hero shows exactly one.
export function dominantPlate(weights: PlateWeights): keyof PlateWeights {
  return (Object.keys(weights) as (keyof PlateWeights)[]).reduce((best, key) =>
    weights[key] > weights[best] ? key : best,
  );
}
