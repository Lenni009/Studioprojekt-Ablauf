<script setup lang="ts">
import { ref } from 'vue';
import { foreignUrl, uniqueId } from '@/variables/id';
import QrcodeVue from 'qrcode.vue';

defineProps<{
  connectedClients: number;
}>();

const dialog = ref<HTMLDialogElement | null>(null);

const close = () => dialog.value?.close();
const open = () => dialog.value?.showModal();
</script>

<template>
  <button @click="open">Connect Here</button>
  <p class="counter">Connected: {{ connectedClients }}</p>
  <dialog
    ref="dialog"
    @click.self="close"
  >
    <article class="dialog-content">
      <header>
        <form method="dialog">
          <button
            aria-label="Close"
            class="close"
          ></button>
        </form>
        <p>Connect to this Instance ID: {{ uniqueId }}</p>
      </header>
      <div>
        <p>
          <a
            :href="foreignUrl"
            target="_blank"
            >{{ foreignUrl }}</a
          >
        </p>
        <QrcodeVue
          :size="1000"
          :value="foreignUrl"
          class="qr-code"
        />
      </div>
    </article>
  </dialog>
</template>

<style scoped>
.counter {
  margin: 0;
}

.dialog-content {
  max-height: 100svh;

  :deep(.qr-code) {
    display: block;
    margin-inline: auto;
    width: min(100%, 95svh) !important;
    height: auto !important;
  }
}
</style>
