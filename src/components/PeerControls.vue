<script setup lang="ts">
import { ref } from 'vue';
import QrcodeVue from 'qrcode.vue';

defineProps<{
  foreignUrl: string;
}>();

const dialog = ref<HTMLDialogElement | null>(null);

const close = () => dialog.value?.close();
const open = () => dialog.value?.showModal();

const isLocal = ref(import.meta.env.DEV);
</script>

<template>
  <button @click="open">Connect Here</button>
  <dialog
    ref="dialog"
    @click.self="close"
  >
    <article>
      <header>
        <span>Connect to this Instance</span>
        <form method="dialog">
          <button
            aria-label="Close"
            class="close"
          ></button>
        </form>
      </header>
      <div>
        <a
          v-if="isLocal"
          :href="foreignUrl"
          target="_blank"
          >{{ foreignUrl }}</a
        >
        <QrcodeVue
          v-else
          :size="1000"
          :value="foreignUrl"
          class="qr-code"
        />
      </div>
    </article>
  </dialog>
</template>

<style>
.qr-code {
  width: 100% !important;
  height: auto !important;
}
</style>
