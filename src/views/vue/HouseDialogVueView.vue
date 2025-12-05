<script setup lang="ts">
import { ViewsManager } from '@/core/commons/managers/ViewsManager';
import { GameManager } from '@/managers/HouseDialogManager';
import { onMounted, onUnmounted } from 'vue';

const currentDatas = ref(GameManager.CurrentData);
const currentDialogIndex = ref(0);

const nextDialog = () => {
  if (currentDialogIndex.value < currentDatas.value.dialogs.length - 1) {
    currentDialogIndex.value++;
  } else {
    onDialogComplete();
  }
};

const onDialogComplete = () => {
  ViewsManager.Show(currentDatas.value.viewId);
};

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
    nextDialog();
  }   
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
});
</script>

<template>
  <View class="cursor-pointer">
    <div class="w-full h-fit absolute bottom-0 left-0 flex justify-center items-end" @click="nextDialog">
      <div class="w-1/5 z-10 translate-x-1/3 h-fit">
        <img 
          draggable="false"
          class="w-full select-none"
          :src="currentDatas.character"
        />
      </div>
      <div class="w-3/6 -translate-y-1/3 relative cursor-pointer" @click="nextDialog">
        <img 
          draggable="false"
          class="w-full select-none"
          :src="currentDatas.dialogs[currentDialogIndex]"
        />
      </div>
    </div>  
  </View>
</template>
