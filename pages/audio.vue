<template>
	<div class="page-container">
		<h1>Chat Audio avec BabouChat</h1>
		<AudioChat v-if="showChat" @close="closeChat" />
		<button v-else @click="showChat = true" class="reopen-btn">Rouvrir le chat</button>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AudioChat from '~/components/AudioChat.vue';

const showChat = ref(true);

function closeChat() {
	showChat.value = false;
}
</script>

<style scoped>
.page-container{
	max-width:900px;
	margin:32px auto;
	padding:16px;
}
h1{
	margin-bottom:16px;
}
</style>
