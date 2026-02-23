<script setup lang="ts">
import type { ScheduleItem } from '@/types/schedule';
import { computed } from 'vue';
import { stringToTimestamp } from '@/helpers/time';

const props = defineProps<{
  data: ScheduleItem;
  ts: number;
  inert: boolean;
}>();

const emit = defineEmits<{
  skip: [amount: number];
}>();

const isCompleted = computed(() => props.ts >= stringToTimestamp(props.data.timestamp));
</script>

<template>
  <tr
    :class="{ 'is-completed': isCompleted }"
    :inert
    class="table-row"
    @click="emit('skip', stringToTimestamp(data.timestamp))"
  >
    <td>{{ data.name }}</td>
    <td>{{ data.timestamp }}</td>
  </tr>
</template>

<style scoped>
.table-row {
  cursor: pointer;

  &:hover {
    background-color: var(--pico-table-row-stripped-background-color);
  }

  td {
    background-color: inherit;
    color: inherit;
  }

  &.is-completed {
    background-color: green;
    color: white;

    &:hover {
      background-color: color-mix(in srgb, green, var(--pico-table-row-stripped-background-color));
    }
  }
}
</style>
