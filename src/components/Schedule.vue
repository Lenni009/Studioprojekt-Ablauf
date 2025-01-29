<script setup lang="ts">
import rawSchedule from '@/assets/schedule.json';
import { useInterval, useTimestamp, useWebSocket } from '@vueuse/core';
import { computed, reactive, ref, watch, watchEffect } from 'vue';
import { expectedLength } from '@/variables/time';
import TableItem from './TableItem.vue';
import type { ScheduleItem, RawScheduleItem } from '@/types/schedule';
import { getFormattedTimeDiff, timestampToString, stringToTimestamp } from '@/helpers/time';
import PeerControls from './PeerControls.vue';
import CodeConnector from './CodeConnector.vue';
import LiveModeToggle from './LiveModeToggle.vue';
import { uniqueString, id, currentYear } from '@/variables/id';

interface SyncData {
  timeElapsed: number;
  actualTimeElapsed: number;
  isLive: boolean;
  isPaused: boolean;
  pausedTime: number;
  pausedAtTimeElapsed: number;
}

const lengths: string[] = rawSchedule.map((item: RawScheduleItem) => item.length);
lengths.push('0:00');

const timestamps: number[] = [0];
lengths.forEach((item, idx) => timestamps.push(stringToTimestamp(item) + timestamps[idx]));

const totalLengthInSeconds = (timestamps.at(-1) ?? 0) / 1000;

const schedule: ScheduleItem[] = rawSchedule.map((item: RawScheduleItem, idx: number) => ({
  name: item.name,
  timestamp: timestampToString(timestamps[idx]),
}));

schedule.push({
  name: 'Ende',
  timestamp: timestampToString(timestamps.at(-1) ?? 0),
});

const liveStartDate = ref(0); // unix timestamp
const startDate = ref(Date.now()); // unix timestamp

const isPaused = ref(false);
const pausedTime = ref(0); // milliseconds
const pausedAtTimestamp = ref(0); // unix timestamp
const pausedAtTimeElapsed = ref(0); // milliseconds

const isLive = ref(false);

watch(
  isLive,
  (newVal) => {
    if (!newVal) return;
    pause();
    reset();
  },
  { immediate: true }
);

const timestamp = useTimestamp({ offset: 0 }); // unix timestamp
const timeElapsed = computed(() =>
  isPaused.value ? pausedAtTimeElapsed.value : timestamp.value - pausedTime.value - startDate.value
);
const timeElapsedInSeconds = computed(() => timeElapsed.value / 1000);
const actualTimeElapsed = computed(() => timestamp.value - liveStartDate.value);
const actualTimeElapsedInSeconds = computed(() => actualTimeElapsed.value / 1000);
const timeDiff = computed(() => Math.floor((timeElapsed.value - actualTimeElapsed.value) / 1000));
const formattedTime = computed(() => timestampToString(timeElapsed.value)); // '1:23' time format string
const formattedActualTime = computed(() => timestampToString(actualTimeElapsed.value)); // '1:23' time format string

const data: SyncData = reactive({
  timeElapsed,
  actualTimeElapsed,
  isLive,
  isPaused,
  pausedTime,
  pausedAtTimeElapsed,
});

watch([startDate, isPaused, pausedAtTimeElapsed, pausedAtTimestamp, pausedTime, isLive, liveStartDate], () => {
  if (!paramsId) sendSync(data);
});

function sync(syncData: SyncData) {
  const currentTimestamp = Date.now();
  startDate.value = currentTimestamp - syncData.timeElapsed;
  liveStartDate.value = currentTimestamp - syncData.actualTimeElapsed;
  isLive.value = syncData.isLive;
  isPaused.value = syncData.isPaused;
  pausedAtTimeElapsed.value = syncData.pausedAtTimeElapsed;
  pausedAtTimestamp.value = currentTimestamp - syncData.pausedAtTimeElapsed;
}

const paramsString = window.location.search;
const searchParams = new URLSearchParams(paramsString);
const paramsId = searchParams.get('id');
const senderId = `${uniqueString}${currentYear}${paramsId}`;

// let connId = 0;
// const sendConn = ref<ConnObj[]>([]);
// const peer = new Peer(id);
// peer.on('open', () => {
//   toast.info('Connected to Server');
//   if (paramsId) peer.connect(senderId);
// });

const { status, data: wsData, send } = useWebSocket(`ws://localhost:8080/ws/${paramsId ? senderId : id}`);

// incoming data handler
watch(
  wsData,
  () => {
    if (wsData.value === 'pong') return;
    console.log('received!');
    const parsedData = JSON.parse(wsData.value);
    const isValidData = isSyncData(parsedData);
    if (isValidData) sync(parsedData);
  },
  { immediate: true }
);

// outgoing data handler
watch(
  status,
  () => {
    if (!paramsId && status.value === 'OPEN') {
      sendSync(data);
    }
  },
  { immediate: true }
);

// heartbeat handler
const counter = useInterval(2000);
watch(
  [counter, status],
  () => {
    if (status.value === 'OPEN') {
      send('ping');
    }
  },
  { immediate: true }
);

// peer.on('connection', (c) => {
//   if (!paramsId) {
//     toast.info('Connection established');
//     // this is for the sender
//     const conn = peer.connect(c.peer);
//     const connObj: ConnObj = {
//       id: connId++,
//       conn,
//     };
//     sendConn.value.push(connObj);
//     conn.on('open', () => {
//       toast.info('Client connected');
//       sendSync(data);
//     });

//     conn.on('close', () => {
//       sendConn.value = sendConn.value.filter((item) => item.id !== connObj.id);
//       toast.info('Client disconnected');
//     });

//     addEventListener('beforeunload', () => {
//       sendConn.value.forEach(({ conn }) => conn.close());
//       peer.destroy();
//     });
//   } else {
//     toast.success('Connected!');
//     // this is for the receiver
//     c.on('data', (recData: unknown) => {
//       const isValidData = isSyncData(recData);
//       if (isValidData) sync(recData);
//     });

//     c.on('close', () => toast.error('Connection lost!'));

//     // clean up connections when tab is closed - This can be quirky on mobile, but doesn't impact functionality, see https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#usage_notes
//     addEventListener('beforeunload', () => {
//       c.close();
//       peer.destroy();
//     });
//   }
// });

function isSyncData(syncData: unknown): syncData is SyncData {
  const expectedDataKeys = Object.keys(data);
  if (!syncData || typeof syncData !== 'object') return false;
  const validKeys = Object.keys(syncData).filter((item: string) => expectedDataKeys.includes(item));
  return validKeys.length === expectedDataKeys.length;
}

// peer.on('disconnected', () => {
//   toast.warning('Connection lost. Trying to reconnect...');
//   peer.reconnect();
// });
// peer.on('close', () => {
//   sendConn.value = [];
//   toast.error('Connection destroyed!');
// });
// peer.on('error', (e) => {
//   console.log(e);
//   toast.error(`An error occurred, connection lost: ${e.type}`);
// });

function sendSync(syncData: SyncData) {
  try {
    console.log('sending sync');
    send(JSON.stringify(syncData));
  } catch (e) {
    console.error(e);
  }
}

// Chrome updates the HTML every millisecond, so we have to avoid this by only updating the dependencies when something actually changed.
const completedItems = ref<ScheduleItem[]>([]);

const getCompletedItems = () =>
  schedule.filter((item: ScheduleItem) => timeElapsed.value >= stringToTimestamp(item.timestamp));

const updateCompletedItems = () => (completedItems.value = getCompletedItems().toReversed());

watchEffect(() => {
  const newFilter = getCompletedItems();
  const newFilterLength = newFilter.length;
  const oldFilterLength = completedItems.value.length;
  if (newFilterLength !== oldFilterLength) updateCompletedItems();
});

const futureItems = computed(() => schedule.filter((item: ScheduleItem) => !completedItems.value.includes(item)));

const currentEvent = computed(() => completedItems.value[0]);
const nextEvent = computed(() => futureItems.value[0]);

function pause() {
  pausedAtTimestamp.value = Date.now();
  pausedAtTimeElapsed.value = timeElapsed.value;
  isPaused.value = true;
}

function resume() {
  const currentTimestamp = Date.now();
  isPaused.value = false;
  pausedTime.value += currentTimestamp - pausedAtTimestamp.value;
  liveStartDate.value = currentTimestamp - pausedAtTimeElapsed.value;
}

function reset() {
  const currentTimestamp = Date.now();
  pausedTime.value = 0;
  startDate.value = currentTimestamp;
  liveStartDate.value = currentTimestamp;
  pausedAtTimeElapsed.value = 0;
  pausedAtTimestamp.value = currentTimestamp;
}

function skip(seconds: number) {
  const milliseconds = seconds * 1000;
  startDate.value += milliseconds * -1;
  pausedAtTimeElapsed.value += milliseconds;
}

function jumpTo(ts: number) {
  if (paramsId) return;
  const distanceToCurrent = ts - timeElapsed.value;
  startDate.value += distanceToCurrent * -1;
  if (!isPaused.value) return;
  pausedAtTimeElapsed.value = ts;
  pausedAtTimestamp.value = startDate.value + ts;
  pausedTime.value = 0;
}
</script>

<template>
  <div
    v-if="!paramsId"
    class="controls-header"
  >
    <div>
      <PeerControls :connected-clients="0" />
    </div>
    <div>
      <LiveModeToggle v-model="isLive" />
      <CodeConnector v-if="1" />
    </div>
  </div>

  <div
    :class="{ 'is-paused': isPaused }"
    class="timer"
  >
    <span
      :class="{
        'is-too-much':
          Math.floor(isLive && !isPaused ? actualTimeElapsedInSeconds : timeElapsedInSeconds) > expectedLength,
      }"
      >{{ isLive && !isPaused ? formattedActualTime : formattedTime }}</span
    >
    <span
      v-if="isLive && timeDiff && !isPaused"
      :class="timeDiff > 0 ? 'ahead' : 'behind'"
      class="time-diff"
      >({{ timeDiff > 0 ? '+' : '' }}{{ timeDiff !== 0 ? timeDiff : '' }}s)</span
    >
  </div>

  <progress
    :max="expectedLength"
    :value="isLive && !isPaused ? actualTimeElapsedInSeconds : timeElapsedInSeconds"
    class="progress"
  ></progress>

  <p
    v-if="totalLengthInSeconds !== expectedLength"
    class="warning"
  >
    Planned time is too {{ totalLengthInSeconds < expectedLength ? 'short' : 'long' }}!
  </p>

  <div class="controls">
    <div class="event-cards">
      <Transition mode="out-in">
        <article
          v-if="nextEvent"
          :aria-disabled="Boolean(paramsId) || undefined"
          :key="`${nextEvent.timestamp}${nextEvent.name}`"
          class="event-card"
          @click="jumpTo(stringToTimestamp(nextEvent.timestamp))"
        >
          <header>Upcoming in {{ getFormattedTimeDiff(timeElapsed, stringToTimestamp(nextEvent.timestamp)) }}</header>
          <div class="event-text">
            <div>{{ nextEvent.name }}</div>
          </div>
        </article>
      </Transition>
      <Transition mode="out-in">
        <article
          v-if="currentEvent"
          :aria-disabled="Boolean(paramsId) || undefined"
          :key="`${currentEvent.timestamp}${currentEvent.name}`"
          class="event-card"
          @click="jumpTo(stringToTimestamp(currentEvent.timestamp))"
        >
          <header>Current</header>
          <div class="event-text">
            <div>{{ currentEvent.name }}</div>
          </div>
        </article>
      </Transition>
    </div>

    <div
      v-if="!paramsId"
      class="control-buttons"
    >
      <button
        :disabled="timeElapsedInSeconds < 1"
        type="button"
        @click="skip(-1)"
      >
        -1s
      </button>
      <button
        type="button"
        @click="skip(1)"
      >
        +1s
      </button>
      <button
        v-if="isPaused"
        type="button"
        @click="resume"
      >
        {{ isLive ? 'Start' : 'Resume' }}
      </button>
      <button
        v-else-if="!isLive"
        type="button"
        @click="pause"
      >
        Pause
      </button>
      <button
        v-if="!isLive"
        class="secondary"
        type="button"
        @click="reset"
      >
        Reset
      </button>
    </div>
    <div v-else>
      <CodeConnector />
    </div>
  </div>

  <hr />

  <div class="table">
    <div>
      <p class="table-caption">Future</p>
      <table class="striped">
        <thead>
          <tr>
            <th>Event</th>
            <th>Time</th>
          </tr>
        </thead>
        <TransitionGroup
          name="future"
          tag="tbody"
        >
          <TableItem
            v-for="item in futureItems"
            v-memo="[completedItems]"
            :aria-disabled="Boolean(paramsId) || undefined"
            :data="item"
            :key="`${item.timestamp}${item.name}`"
            :ts="timeElapsed"
            @skip="jumpTo"
          />
        </TransitionGroup>
      </table>
    </div>
    <div>
      <p class="table-caption">Done</p>
      <table class="striped">
        <thead>
          <tr>
            <th>Event</th>
            <th>Time</th>
          </tr>
        </thead>
        <TransitionGroup
          name="done"
          tag="tbody"
        >
          <TableItem
            v-for="item in completedItems"
            v-memo="[completedItems]"
            :aria-disabled="Boolean(paramsId) || undefined"
            :data="item"
            :key="`${item.timestamp}${item.name}`"
            :ts="timeElapsed"
            @skip="jumpTo"
          />
        </TransitionGroup>
      </table>
    </div>
  </div>
</template>

<style scoped>
.controls-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
}

.warning {
  background-color: red;
  color: white;
  border-radius: var(--pico-border-radius);
  padding: 0.5rem;
  text-align: center;
}

.v-enter-active,
.v-leave-active {
  transition: background-color 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  --pico-card-background-color: var(--pico-contrast-background);
  --pico-card-sectioning-background-color: var(--pico-contrast-background);
}

.table {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: start;

  .table-caption {
    text-align: center;
    font-weight: bold;
  }

  th {
    font-weight: bold;
  }
}

.controls {
  display: flex;
  justify-content: end;
  gap: 1rem;
  margin-block: 1rem;

  > * {
    margin: 0;
    height: fit-content;
  }

  .control-buttons {
    display: flex;
    justify-content: end;
    gap: 0.5rem;
    flex-wrap: wrap;

    * {
      margin: 0;
    }
  }

  &:has(.event-card) {
    justify-content: space-between;
  }

  .event-cards {
    display: flex;
    gap: 1rem;

    .event-card {
      cursor: default;

      &:not([aria-disabled]) {
        cursor: pointer;

        &:hover:not(.v-enter-active, .v-leave-active) {
          &,
          & * {
            background-color: color-mix(
              in srgb,
              var(--pico-contrast-background) 3%,
              var(--pico-card-background-color) 100%
            );
          }
        }
      }

      header {
        text-align: center;
        font-weight: bold;
        margin-block-end: 0;
        transition: inherit;
      }

      .event-text {
        display: flex;
        gap: 0.5rem;
        align-items: center;

        > * {
          font-size: larger;
          text-align: center;
        }
      }
    }
  }
}

.timer {
  font-size: 4rem;
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 1rem;

  .time-diff {
    font-size: 2.5rem;

    &.ahead {
      color: green;
    }

    &.behind {
      color: red;
    }
  }

  &.is-paused {
    background-color: tomato;
  }

  .is-too-much {
    color: crimson;
  }
}

.future-move, /* apply transition to moving elements */
.done-move,
.future-enter-active,
.done-enter-active,
.future-leave-active,
.done-leave-active {
  transition: all 0.5s ease;
}

.future-enter-from,
.future-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.done-enter-from,
.done-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.future-leave-active,
.done-leave-active {
  position: absolute;
}
</style>
