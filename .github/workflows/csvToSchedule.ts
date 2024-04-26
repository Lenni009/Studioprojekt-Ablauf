import { RawScheduleItem } from '../../src/types/schedule.ts';

const separator = ',';
const csvPath = `./Sendeablauf.csv`;

const csvContent = Deno.readTextFileSync(csvPath);

const csvRows = csvContent.replaceAll('\r', '').split('\n');

const csvRowData = csvRows.map((item) => item.split(separator));

const lastDataIndex = csvRowData.findLastIndex((item) => item[1]);
const scheduleDataArray: string[][] = csvRowData.slice(1, lastDataIndex + 1); // remove header row and remove trailing math rows that are in the sheet for time calculations

const scheduleDataObjects: RawScheduleItem[] = [];

for (const item of scheduleDataArray) {
  const obj: RawScheduleItem = {
    length: item.shift().replaceAll(',0', '') || '0:00',
    name: item.join(' '),
  };
  scheduleDataObjects.push(obj);
}

const scheduleString = JSON.stringify(scheduleDataObjects, null, 2);

Deno.writeTextFileSync('schedule.json', scheduleString);
