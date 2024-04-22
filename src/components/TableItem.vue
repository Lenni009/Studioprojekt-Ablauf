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
  <tr :class="{ 'is-completed': isCompleted }">
    <td>{{ data.name }}</td>
    <td>{{ data.timestamp }}</td>
  </tr>
</template>

<style scoped lang="scss">
.is-completed * {
  background-color: green !important;
}
</style>
