<script setup lang="ts">
import { computed } from 'vue';
import { stringToTimestamp } from '@/helpers/time';
import type { ScheduleItem } from '@/types/schedule';

const props = defineProps<{
  data: ScheduleItem;
  ts: number;
}>();

const isCompleted = computed(() => props.ts >= stringToTimestamp(props.data.timestamp));
</script>

<template>
  <div
    :class="{ 'is-completed': isCompleted }"
    class="table-item"
  >
    <div>{{ data.name }}</div>
    <div>{{ data.timestamp }}</div>
  </div>
</template>

<style scoped lang="scss">
.table-item {
  display: flex;
  gap: 0.5rem;

  &.is-completed {
    background-color: green;
  }
}
</style>
