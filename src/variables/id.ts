export const uniqueString = 'PenPixels';
export const uniquenessPrecision = 4; // defines how many "random" numbers should be appended to the id

export const uniqueId = Date.now()
  .toString()
  .slice(uniquenessPrecision * -1);
export const id = `${uniqueString}${uniqueId}`;
export const foreignUrl = `${window.location.origin}?id=${id}`;
