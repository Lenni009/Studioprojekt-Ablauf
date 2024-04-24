export function stringToTimestamp(time: string): number {
  const [minutes, seconds] = time.split(':').map((item) => parseInt(item));
  return (minutes * 60 + seconds) * 1000;
}

export function timestampToString(time: number): string {
  const timeInSeconds = Math.floor(time / 1000);
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${Math.floor(minutes)}:${seconds.toString().padStart(2, '0')}`;
}

export function getFormattedTimeDiff(time1: number, time2: number) {
  // converting them to seconds rounding down to get the "expected" result on screen
  const diff = Math.floor(time2 / 1000) - Math.ceil(time1 / 1000);
  return timestampToString(diff * 1000);
}
