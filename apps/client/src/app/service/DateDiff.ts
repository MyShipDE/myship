export function dateDiff(
  dateStart: Date,
  dateEnd: Date | string = new Date,
  ...units: string[]
): {
  [key: string]: number
} {
  if (typeof dateEnd === 'string') {
    dateEnd = new Date();
  }

  let delta: number = Math.abs(dateStart.getTime() - dateEnd.getTime());

  return (units.length ? units : Object.keys(dateDiffDef))
    .reduce((res: object, key: string) => {
      if (!dateDiffDef.hasOwnProperty(key)) {
        throw new Error('Unknown unit in dateDiff: ' + key);
      }
      res[key] = Math.floor(delta / dateDiffDef[key]);
      delta -= res[key] * dateDiffDef[key];
      return res;
    }, {});
}

// default time units for dateDiff
export const dateDiffDef = {
  millennium: 31536000000000,
  century: 3153600000000,
  decade: 315360000000,
  year: 31536000000,
  quarter: 7776000000,
  month: 2592000000,
  week: 604800000,
  day: 86400000,
  hour: 3600000,
  minute: 60000,
  second: 1000,
  millisecond: 1
};
