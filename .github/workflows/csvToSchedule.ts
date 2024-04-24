import { RawScheduleItem } from '../../src/types/schedule.ts';
import { convertXlsxToCsv } from 'npm:xlsx-to-csv-ts';

const downloadLocation = './download/';

const separator = ',';
const csvPath = `${downloadLocation}Sendeablauf.csv`;

const csvContent = Deno.readTextFileSync(csvPath);

const csvRows = csvContent.replaceAll('\r', '').split('\n');

const csvDataRows = csvRows.slice(1);
const csvRowData = csvDataRows.map((item) => item.split(separator));

const lastDataIndex = csvRowData.findLastIndex((item) => item[1]);
const scheduleDataArray: string[][] = csvRowData.slice(0, lastDataIndex + 1);

const scheduleDataObjects: RawScheduleItem[] = [];

for (const item of scheduleDataArray) {
  const obj: RawScheduleItem = {
    name: item[1],
    length: item[0].replaceAll(',0', '') || '0:20',
  };
  scheduleDataObjects.push(obj);
}

const scheduleString = JSON.stringify(scheduleDataObjects, null, 2);

Deno.writeTextFileSync(`${downloadLocation}ablauf.json`, scheduleString);
