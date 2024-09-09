<script setup lang="ts">
import { computed, ref } from 'vue';
import { uniquenessPrecision as idLength } from '@/variables/id';

const id = ref('');
const dialog = ref<HTMLDialogElement | null>(null);
const link = computed(() => `${window.location.origin}?id=${id.value}`);

const isIdValid = computed(() => id.value.length === idLength);

const open = () => dialog.value?.showModal();
const close = () => dialog.value?.close();
</script>

<template>
  <button @click="open">Connect</button>
  <dialog
    ref="dialog"
    @click.self="close"
  >
    <article>
      <header>
        <form method="dialog">
          <button
            aria-label="Close"
            class="close"
          ></button>
        </form>
        <p>Connect to another Instance</p>
      </header>
      <form>
        <fieldset role="group">
          <input
            v-model="id"
            :maxlength="idLength"
            :minlength="idLength"
            :pattern="`[0-9]{${idLength}}`"
            inputmode="numeric"
            name="id"
            placeholder="0000"
            type="text"
            autofocus
          />
          <a
            :aria-disabled="!isIdValid"
            :class="{ disabled: !isIdValid }"
            :href="link"
            role="button"
            >Connect</a
          >
        </fieldset>
      </form>
    </article>
  </dialog>
</template>

<style scoped lang="scss">
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
