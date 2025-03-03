<script setup lang="ts">
import { ref } from 'vue';

const isLive = defineModel({ type: Boolean });

const liveDialog = ref<HTMLDialogElement | null>(null);

function switchLiveMode(e: Event) {
  if (isLive.value) {
    e.preventDefault();
    liveDialog.value?.showModal();
  } else {
    isLive.value = true;
  }
}
</script>

<template>
  <label for="isLive">
    <input
      v-model="isLive"
      :aria-checked="isLive"
      id="isLive"
      role="switch"
      type="checkbox"
      @click="switchLiveMode"
    />
    <span>Live Mode</span>
  </label>
  <dialog ref="liveDialog">
    <article>
      <header>
        <form method="dialog">
          <button
            aria-label="Close"
            class="close"
          ></button>
        </form>
        <p>Do you really want to disable live mode?</p>
      </header>
      <form
        class="dialog-buttons"
        method="dialog"
      >
        <button @click="isLive = false">Yes, deactivate</button>
        <button class="secondary">Cancel</button>
      </form>
    </article>
  </dialog>
</template>

<style scoped>
.dialog-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
