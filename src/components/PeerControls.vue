<script setup lang="ts">
import { ref } from 'vue';
import { type DataConnection, Peer } from 'peerjs';

interface PropsData {
  startDate: number;
  isPaused: boolean;
  pausedTime: number;
  pausedAtTimestamp: number;
  pausedAtTimeElapsed: number;
}

const props = defineProps<{ data: PropsData }>();

const emit = defineEmits<{
  sync: [data: PropsData];
}>();

const foreignId = ref('');

const uniqueId = Date.now().toString().slice(-6);
const peerId = `PenPixels${uniqueId}`;

const type = ref('');

let sendConn: DataConnection | null, recConn: DataConnection | null;
const peer = new Peer(peerId);
peer.on('open', function (id: string) {
  console.log(`connected using id ${id}`);
  console.log('Awaiting connection...');
});

function connect() {
  sendConn = peer.connect(foreignId.value);
  peer.on('connection', (c) => {
    console.log('connected!');
    recConn = c;

    recConn?.on('data', function (data: any) {
      console.log('Data received');
      console.log(data);
      emit('sync', data);
    });
  });

  peer.on('disconnected', function () {
    console.log('Connection lost. Please reconnect');

    peer.reconnect();
  });
  peer.on('close', function () {
    recConn = null;
    sendConn = null;
    console.log('Connection destroyed. Please refresh');
  });
  peer.on('error', function (err) {
    console.error(err);
  });
}

function sync() {
  sendConn?.send(JSON.stringify(props.data));
}
</script>

<template>
  <div class="inputs">
    <p>Your ID:</p>
    <p>{{ peerId }}</p>
    <input
      v-model="foreignId"
      placeholder="Connect to ID"
      type="text"
    />
    <div>
      <label for="send">
        <input
          v-model="type"
          name="role"
          type="radio"
          value="send"
          id="send"
        />
        <span>Send</span>
      </label>
      <label for="receive">
        <input
          v-model="type"
          name="role"
          type="radio"
          value="receive"
          id="receive"
        />
        <span>Receive</span>
      </label>
    </div>
    <button @click="connect">Connect</button>
    <button @click="sync">Sync</button>
  </div>
</template>

<style scoped lang="scss">
.inputs {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
