import { defineStore } from 'pinia';

// Define state object structure
interface TemplateData {
  hello: string;
}

export const useTemplateDataStore = defineStore('templateData', {
  state: (): TemplateData => ({
    hello: 'world',
  }),

  // derive values from state (similar to computed properties)
  getters: {
    substring: (state) => state.hello.substring(1, 2),
  },

  // mutate state
  actions: {
    mutateState() {
      this.hello = 'Eisvana';
    },
  },
});
