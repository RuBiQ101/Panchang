function getAyanamsa(date: Date): number {
  const t = (date.getTime() / 86400000 - 10957.5) / 36525;
  const omega = 125.04452 - 1934.136261 * t;
  const l0 = 280.4665 + 36000.7698 * t;
  const l1 = 218.3165 + 481267.8813 * t;
  const deltaPsi = -0.00478 * Math.sin(omega * Math.PI / 180) - 0.00039 * Math.sin(l0 * Math.PI / 180);
  const epsilon = 23.4392911 - 0.0130042 * t;
  const ayanamsa = 23.51142 + 0.013964 * t + deltaPsi * Math.cos(epsilon * Math.PI / 180);
  return ayanamsa;
}
console.log(getAyanamsa(new Date('2026-02-13T00:00:00Z')));
