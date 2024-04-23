<script setup lang="ts">
import { computed } from 'vue';
import { stringToTimestamp } from '@/helpers/time';
import type { ScheduleItem } from '@/types/schedule';

const props = defineProps<{
  data: ScheduleItem;
  ts: number;
}>();

const emit = defineEmits<{
  skip: [amount: number];
}>();

const isCompleted = computed(() => props.ts >= stringToTimestamp(props.data.timestamp));
</script>

<template>
  <tr
    :class="{ 'is-completed': isCompleted }"
    class="table-row"
    @click="$emit('skip', stringToTimestamp(data.timestamp))"
  >
    <td>{{ data.name }}</td>
    <td>{{ data.timestamp }}</td>
  </tr>
</template>

<style scoped lang="scss">
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
