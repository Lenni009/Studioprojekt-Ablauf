<script setup lang="ts">
import schedule from '@/assets/ablauf.json';
import { useTimestamp } from '@vueuse/core';
import { computed, ref } from 'vue';
import { expectedLength } from '@/variables/time';
import TableItem from './TableItem.vue';
import type { ScheduleItem } from '@/types/schedule';
import { getFormattedTimeDiff, timestampToString, stringToTimestamp } from '@/helpers/time';

const startDate = Date.now();

const isPaused = ref(false);
const pausedTime = ref(0);
const pausedAtTimestamp = ref(0);
const pausedAtTimeElapsed = ref(0);

const timestamp = useTimestamp({ offset: 0 });
const timeElapsed = computed(() =>
  isPaused.value ? pausedAtTimeElapsed.value : timestamp.value - pausedTime.value - startDate
);
const timeElapsedInSeconds = computed(() => timeElapsed.value / 1000);
const formattedTime = computed(() => timestampToString(timeElapsed.value));

const lastEventIndex = computed(() =>
  schedule.findLastIndex((item: ScheduleItem) => stringToTimestamp(item.timestamp) >= timeElapsed.value)
);

function pause() {
  pausedAtTimestamp.value = Date.now();
  pausedAtTimeElapsed.value = timeElapsed.value;
  isPaused.value = true;
}

function resume() {
  isPaused.value = false;
  pausedTime.value += Date.now() - pausedAtTimestamp.value;
}
</script>

<template>
  <div
    :class="{ 'is-paused': isPaused }"
    class="timer"
  >
    {{ formattedTime }}
  </div>

  <progress
    class="progress"
    :max="expectedLength"
    :value="timeElapsedInSeconds"
  ></progress>

  <div v-if="lastEventIndex !== -1">Last: {{ schedule[lastEventIndex].name }}</div>
  <template v-if="lastEventIndex !== schedule.length - 1">
    <div>Next: {{ schedule[lastEventIndex + 1].name }}</div>
    <div>
      Next in: {{ getFormattedTimeDiff(timeElapsed, stringToTimestamp(schedule[lastEventIndex + 1].timestamp)) }}
    </div>
  </template>

  <div class="table">
    <TableItem
      v-for="item in schedule"
      :data="item"
      :key="item.name"
      :ts="timeElapsed"
    />
  </div>
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
</template>

<style scoped lang="scss">
.table {
  display: flex;
  flex-direction: column;
}

.timer {
  font-size: 4rem;
  text-align: center;

  &.is-paused {
    background-color: red;
  }
}

.time-until-next {
  font-size: larger;
}
</style>
