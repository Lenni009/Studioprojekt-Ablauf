<script setup lang="ts">
import { useTimestamp } from '@vueuse/core';

const { timestamp, pause, resume } = useTimestamp({ controls: true });
</script>

<template>
    Current Time: {{ timestamp }}
    <button @click="pause()">Pause</button>
    <button @click="resume()">Resume</button>
</template>
