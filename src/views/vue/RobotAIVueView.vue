<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ViewsManager } from '@/core/commons/managers/ViewsManager';
import { ViewId } from '@/core/commons/constants/views/ViewId';


const showChat = ref(true);

function closeChat() {
	showChat.value = false;
}

function openChat() {
	showChat.value = true;
}

const hide = () => {
	ViewsManager.Hide(ViewId.ROBOT_A_I);
};

const handleClickOutside = (event: MouseEvent) => {
	const chatElement = document.querySelector('.audio-chat-root');
	if (chatElement && !chatElement.contains(event.target as Node)) {
		hide();
	}
};

// Écouter les événements depuis la scène 3D
onMounted(() => {
	if (typeof window !== 'undefined') {
		window.addEventListener('openChat', openChat);
		window.addEventListener('closeChat', closeChat);
		// Ajouter le listener pour les clics en dehors
		setTimeout(() => {
			document.addEventListener('click', handleClickOutside);
		}, 100);
	}
});

onBeforeUnmount(() => {
	if (typeof window !== 'undefined') {
		window.removeEventListener('openChat', openChat);
		window.removeEventListener('closeChat', closeChat);
		document.removeEventListener('click', handleClickOutside);
	}
});
</script>

<template>
  <View>
    <div class="home-page page-container">
      <AudioChat v-if="showChat" @close="closeChat" />
    </div>
  </View>
</template>

<style scoped>
  .page-container{ 
    position: absolute;
    bottom: 10px;
    left: 15px;
    width: 100%;
    height: 100%;
    margin: 22px auto; 
    padding: 0 16px;
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
  }
  h1{ margin-bottom:16px }
  /* .home-page { position: relative; z-index: 20000; } */
</style>