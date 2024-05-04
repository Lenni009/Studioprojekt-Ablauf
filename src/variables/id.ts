export const uniqueString = 'Studioprojekt';
export const uniquenessPrecision = 4; // defines how many "random" numbers should be appended to the id

const currentTimestamp = Date.now();
export const currentYear = new Date(currentTimestamp).getUTCFullYear().toString();
export const uniqueId = currentTimestamp.toString().slice(uniquenessPrecision * -1);
export const id = `${uniqueString}${currentYear}${uniqueId}`;
export const foreignUrl = `${window.location.origin}?id=${uniqueId}`;
