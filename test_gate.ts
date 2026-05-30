import Astronomy from 'astronomy-engine';
const { Observer, Body, SearchRiseSet, AstroTime, GeoVector, Ecliptic } = Astronomy;

function getAyanamsa(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const fraction = (month * 30 + day) / 365.25;
  return 23.853056 + (year + fraction - 2000) * 0.0139697;
}

const date = new Date('2026-02-25T12:00:00+05:30'); // Feb 25 noon IST
const time = new AstroTime(date);
const sunVec = GeoVector(Body.Sun, time, true);
const sunEcl = Ecliptic(sunVec);
const ayanamsa = getAyanamsa(date);
const sunLong = (sunEcl.elon - ayanamsa + 360) % 360;

const currentSunSign = Math.floor(sunLong / 30);
let sDate = new Date(date);
let sankrantiTime = sDate.getTime();

for (let i = 0; i <= 32; i++) {
  const tTime = new AstroTime(sDate);
  const tSunVec = GeoVector(Body.Sun, tTime, true);
  const tSunEcl = Ecliptic(tSunVec);
  const tAyanamsa = getAyanamsa(sDate);
  const tSunLong = (tSunEcl.elon - tAyanamsa + 360) % 360;
  
  if (Math.floor(tSunLong / 30) !== currentSunSign) {
    let left = sDate.getTime();
    let right = left + 86400000;
    
    for (let step = 0; step < 15; step++) {
      const mid = (left + right) / 2;
      const mTime = new AstroTime(new Date(mid));
      const mSunVec = GeoVector(Body.Sun, mTime, true);
      const mSunEcl = Ecliptic(mSunVec);
      const mAyanamsa = getAyanamsa(new Date(mid));
      const mSunLong = (mSunEcl.elon - mAyanamsa + 360) % 360;
      
      if (Math.floor(mSunLong / 30) !== currentSunSign) {
        left = mid;
      } else {
        right = mid;
      }
    }
    sankrantiTime = right;
    break;
  }
  sDate.setDate(sDate.getDate() - 1);
}

const sankrantiDateObj = new Date(sankrantiTime);
console.log("Sankranti Time:", sankrantiDateObj.toISOString());
const targetDateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
const sankrantiDateMidnight = new Date(sankrantiDateObj.getFullYear(), sankrantiDateObj.getMonth(), sankrantiDateObj.getDate());
const gate = Math.round((targetDateMidnight.getTime() - sankrantiDateMidnight.getTime()) / 86400000) + 1;
console.log("Gate:", gate);
