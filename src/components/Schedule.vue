<script setup lang="ts">
import json from '@/assets/ablauf.json';
import { useTimestamp } from '@vueuse/core';
import { computed, ref } from 'vue';
import { expectedLength } from '@/variables/time';
import TableItem from './TableItem.vue';

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

function timestampToString(time: number): string {
  const timeInSeconds = Math.floor(time / 1000);
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${Math.floor(minutes)}:${seconds.toString().padStart(2, '0')}`;
}

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
  <progress
    class="progress"
    :max="expectedLength"
    :value="timeElapsedInSeconds"
  ></progress>

  <div>
    <span>Current Date:</span>
    <span>{{ formattedTime }}</span>
  </div>

  <div class="table">
    <TableItem
      v-for="item in json"
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
</style>
