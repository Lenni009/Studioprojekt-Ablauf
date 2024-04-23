<script setup lang="ts">
import schedule from '@/assets/ablauf.json';
import { useTimestamp } from '@vueuse/core';
import { computed, ref, watch } from 'vue';
import { expectedLength } from '@/variables/time';
import TableItem from './TableItem.vue';
import type { ScheduleItem } from '@/types/schedule';
import { getFormattedTimeDiff, timestampToString, stringToTimestamp } from '@/helpers/time';

const startDate = ref(Date.now());

const isPaused = ref(false);
const pausedTime = ref(0);
const pausedAtTimestamp = ref(0);
const pausedAtTimeElapsed = ref(0);

const timestamp = useTimestamp({ offset: 0 });
const timeElapsed = computed(() =>
  isPaused.value ? pausedAtTimeElapsed.value : timestamp.value - pausedTime.value - startDate.value
);
const timeElapsedInSeconds = computed(() => timeElapsed.value / 1000);
const formattedTime = computed(() => timestampToString(timeElapsed.value));

// Chrome updates the HTML every millisecond, so we have to avoid this by only updating the UI when something actually changed.
const completedItems = ref<ScheduleItem[]>([]);

const updateCompletedItems = () =>
  (completedItems.value = schedule
    .filter((item: ScheduleItem) => timeElapsed.value >= stringToTimestamp(item.timestamp))
    .toReversed());

watch(timeElapsed, (newVal) => {
  const newFilter = schedule.filter((item: ScheduleItem) => newVal >= stringToTimestamp(item.timestamp));
  const newFilterLength = newFilter.length;
  const oldFilterLength = completedItems.value.length;
  if (newFilterLength !== oldFilterLength) updateCompletedItems();
});

const futureItems = computed(() => schedule.filter((item: ScheduleItem) => !completedItems.value.includes(item)));

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
  pausedTime.value = 0;
  startDate.value = Date.now();
  isPaused.value = false;
}

const skip = (seconds: number) => (startDate.value += seconds * 1000);

function jumpTo(ts: number) {
  const distanceToCurrent = ts - timeElapsed.value;
  startDate.value += distanceToCurrent * -1;
}
</script>

<template>
  <div
    :class="{ 'is-paused': isPaused, 'is-too-much': timeElapsedInSeconds > expectedLength }"
    class="timer"
  >
    {{ formattedTime }}
  </div>

  <progress
    class="progress"
    :max="expectedLength"
    :value="timeElapsedInSeconds"
  ></progress>

  <div class="controls">
    <Transition mode="out-in">
      <article
        v-if="nextEvent"
        :key="`${nextEvent.timestamp}${nextEvent.name}`"
        class="next-event-card"
        @click="jumpTo(stringToTimestamp(nextEvent.timestamp))"
      >
        <header>Upcoming:</header>
        <div class="next-event-text">
          <div>{{ nextEvent.name }}</div>
          <div>{{ getFormattedTimeDiff(timeElapsed, stringToTimestamp(nextEvent.timestamp)) }}</div>
        </div>
      </article>
    </Transition>

    <div class="control-buttons">
      <button
        :disabled="timeElapsedInSeconds < 10"
        type="button"
        @click="skip(10)"
      >
        -10
      </button>
      <button
        type="button"
        @click="skip(-10)"
      >
        +10
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

  &:has(.next-event-card) {
    justify-content: space-between;
  }

  .next-event-card {
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

    header {
      text-align: center;
      font-weight: bold;
      margin-block-end: 0;
      transition: inherit;
    }

    .next-event-text {
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
