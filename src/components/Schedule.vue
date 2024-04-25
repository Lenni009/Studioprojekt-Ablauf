<script setup lang="ts">
import rawSchedule from '@/assets/schedule.json';
import { useTimestamp } from '@vueuse/core';
import { computed, onUnmounted, reactive, ref, watch, watchEffect } from 'vue';
import { expectedLength } from '@/variables/time';
import TableItem from './TableItem.vue';
import type { ScheduleItem, RawScheduleItem } from '@/types/schedule';
import { getFormattedTimeDiff, timestampToString, stringToTimestamp } from '@/helpers/time';
import PeerControls from './PeerControls.vue';
import Peer, { type DataConnection } from 'peerjs';

interface SyncData {
  startDate: number;
  isPaused: boolean;
  pausedTime: number;
  pausedAtTimestamp: number;
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
  timestamp: timestampToString(timestamps.at(-1)),
});

const startDate = ref(Date.now()); // unix timestamp

const isPaused = ref(false);
const pausedTime = ref(0); // milliseconds
const pausedAtTimestamp = ref(0); // unix timestamp
const pausedAtTimeElapsed = ref(0); // milliseconds

const data: SyncData = reactive({
  startDate,
  isPaused,
  pausedTime,
  pausedAtTimestamp,
  pausedAtTimeElapsed,
});

function sync(syncData: SyncData) {
  startDate.value = syncData.startDate;
  isPaused.value = syncData.isPaused;
  pausedTime.value = syncData.pausedTime;
  pausedAtTimestamp.value = syncData.pausedAtTimestamp;
  pausedAtTimeElapsed.value = syncData.pausedAtTimeElapsed;
}

const paramsString = window.location.search;
const searchParams = new URLSearchParams(paramsString);
const senderId = searchParams.get('id');

const uniquenessPrecision = 4; // defines how many "random" numbers should be appended to the id
const uniqueId = Date.now()
  .toString()
  .slice(uniquenessPrecision * -1);
const id = `PenPixels${uniqueId}`;
const foreignUrl = `${window.location.origin}?id=${id}`;

const sendConn = ref<DataConnection[]>([]);
const peer = new Peer(id, {
  config: {
    iceServers: [{ urls: 'stun:74.125.142.127:19302' }], // stun.l.google.com - Firefox does not support DNS names
  },
});
peer.on('open', function () {
  if (senderId) peer.connect(senderId);
});

peer.on('connection', (c) => {
  if (!senderId) {
    // this is for the sender
    const conn = peer.connect(c.peer);
    sendConn.value.push(conn);
    conn.on('open', () => sendSync(data));
  } else {
    // this is for the receiver
    c.on('data', (recData: unknown) => {
      const isValidData = isSyncData(recData);
      if (!isValidData) return;
      sync(recData);
    });
  }
});

function isSyncData(syncData: unknown): syncData is SyncData {
  const expectedDataKeys = Object.keys(data);
  if (!syncData || typeof syncData !== 'object') return false;
  const validKeys = Object.keys(syncData).filter((item: string) => expectedDataKeys.includes(item));
  return validKeys.length === expectedDataKeys.length;
}

peer.on('disconnected', function () {
  console.log('Connection lost. Please reconnect');
  peer.reconnect();
});
peer.on('close', function () {
  sendConn.value = [];
  console.log('Connection destroyed. Please refresh');
});
peer.on('error', function (err) {
  console.error(err);
});

onUnmounted(() => peer.destroy());

function sendSync(syncData: SyncData) {
  sendConn.value.forEach((conn) => {
    try {
      conn.send(syncData);
    } catch (e) {
      console.error(e);
    }
  });
}

watch([startDate, isPaused, pausedAtTimeElapsed, pausedAtTimestamp, pausedTime], () => sendSync(data));

const timestamp = useTimestamp({ offset: 0 }); // unix timestamp
const timeElapsed = computed(() =>
  isPaused.value ? pausedAtTimeElapsed.value : timestamp.value - pausedTime.value - startDate.value
);
const timeElapsedInSeconds = computed(() => timeElapsed.value / 1000);
const formattedTime = computed(() => timestampToString(timeElapsed.value)); // '1:23' time format string

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
  isPaused.value = false;
  pausedTime.value += Date.now() - pausedAtTimestamp.value;
}

function reset() {
  const currentTimestamp = Date.now();
  pausedTime.value = 0;
  startDate.value = currentTimestamp;
  pausedAtTimeElapsed.value = 0;
  pausedAtTimestamp.value = currentTimestamp;
}

function skip(seconds: number) {
  const milliseconds = seconds * 1000;
  startDate.value += milliseconds;
  pausedAtTimeElapsed.value += milliseconds * -1;
}

function jumpTo(ts: number) {
  if (senderId) return;
  const distanceToCurrent = ts - timeElapsed.value;
  startDate.value += distanceToCurrent * -1;
  if (!isPaused.value) return;
  pausedAtTimeElapsed.value = ts;
  pausedAtTimestamp.value = startDate.value + ts;
  pausedTime.value = 0;
}
</script>

<template>
  <PeerControls
    v-if="!senderId"
    :foreign-url
    :connected-clients="sendConn.length"
  />
  <div
    :class="{ 'is-paused': isPaused, 'is-too-much': timeElapsedInSeconds > expectedLength }"
    class="timer"
  >
    {{ formattedTime }}
  </div>

  <progress
    :max="expectedLength"
    :value="timeElapsedInSeconds"
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
          :aria-disabled="Boolean(senderId) || undefined"
          :key="`${nextEvent.timestamp}${nextEvent.name}`"
          class="event-card"
          @click="jumpTo(stringToTimestamp(nextEvent.timestamp))"
        >
          <header>Upcoming in {{ getFormattedTimeDiff(timeElapsed, stringToTimestamp(nextEvent.timestamp)) }}:</header>
          <div class="event-text">
            <div>{{ nextEvent.name }}</div>
          </div>
        </article>
      </Transition>
      <Transition mode="out-in">
        <article
          v-if="currentEvent"
          :aria-disabled="Boolean(senderId) || undefined"
          :key="`${currentEvent.timestamp}${currentEvent.name}`"
          class="event-card"
          @click="jumpTo(stringToTimestamp(currentEvent.timestamp))"
        >
          <header>Current:</header>
          <div class="event-text">
            <div>{{ currentEvent.name }}</div>
          </div>
        </article>
      </Transition>
    </div>

    <div
      v-if="!senderId"
      class="control-buttons"
    >
      <button
        :disabled="timeElapsedInSeconds < 1"
        type="button"
        @click="skip(1)"
      >
        -1s
      </button>
      <button
        type="button"
        @click="skip(-1)"
      >
        +1s
      </button>
      <button
        v-if="isPaused"
        type="button"
        @click="resume"
      >
        Resume
      </button>
      <button
        v-else
        type="button"
        @click="pause"
      >
        Pause
      </button>
      <button
        class="secondary"
        type="button"
        @click="reset"
      >
        Reset
      </button>
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
            :aria-disabled="Boolean(senderId) || undefined"
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
            :aria-disabled="Boolean(senderId) || undefined"
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

<style scoped lang="scss">
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
  text-align: center;

  &.is-paused {
    background-color: tomato;
  }

  &.is-too-much {
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
