<template>
	<div class="page-container">
		<h1>Chat Audio avec Amel</h1>
		<AudioChat />
	</div>
</template>

<script setup lang="ts">
import AudioChat from '~/components/AudioChat.vue'
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
