<template>
  <div class="home-page page-container">
    <h1>Accueil — Chat Audio avec Amel</h1>
    <AudioChat />
  </div>
</template>

<script setup lang="ts">
import { SceneId } from '@/core/commons/constants/scenes/SceneId';
import { ScenesManager } from '@/core/commons/managers/ScenesManager';
import AudioChat from '~/components/AudioChat.vue';

useMainStart(() => {
  ScenesManager.Show(SceneId.DEFAULT);
});
</script>

<style scoped>
.page-container{ max-width:900px; margin:32px auto; padding:16px; }
h1{ margin-bottom:16px }
.home-page { position: relative; z-index: 20000; }
</style>