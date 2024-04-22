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
  const diff = (time2 - time1) + 1000;
  return timestampToString(diff);
}
