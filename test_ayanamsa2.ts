function getAyanamsa(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const fraction = (month * 30 + day) / 365.25;
  return 23.853056 + (year + fraction - 2000) * 0.0139697;
}
console.log(getAyanamsa(new Date('2026-02-13T00:00:00Z')));
