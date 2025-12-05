<script setup lang="ts">
import type { MapCameraController } from '@/controllers/cameras/MapCameraController';
import { CamerasId } from '@/core/three/constants/CamerasId';
import { CamerasManager } from '@/core/three/managers/CamerasManager';
import { GameManager } from '@/managers/GameManager';
import { PNJDatas, PNJHouseIndices } from '../../constants/PNJConstants';

const camera = ref<MapCameraController>(CamerasManager.Get<MapCameraController>(CamerasId.MAP));
const name = ref<string>();
const prevName = ref<string>();
const animKey = ref(0);

const ctaVisible = ref(true);

onMounted(() => {
  const updateName = () => {
    prevName.value = name.value;
    name.value = PNJDatas[camera.value.currentHousePNJ].house;
    animKey.value++;
  }

  camera.value.onFocusedHouseChange.add(updateName);
  name.value = PNJDatas[camera.value.currentHousePNJ].house;

  GameManager.OnShow.add(() => ctaVisible.value = false);
  GameManager.OnHide.add(() => ctaVisible.value = true);
  
  onUnmounted(() => {
    camera.value.onFocusedHouseChange?.remove(updateName);
  });
});

const click = () => {
  const pnjId = PNJHouseIndices[camera.value.pnjHouseId];
  const data = PNJDatas[pnjId];
  
  GameManager.Show(data);
}
</script>

<template>
  <View class="flex items-center justify-center pointer-events-none">
    <div class="absolute bg-[#00000099] backdrop-blur-2xl p-20 px-40 text-white top-20 uppercase overflow-hidden flex items-center justify-center padding-10">
      <h1 
        :key="animKey"
        class="text-28 animate-slide-up"
      >  
        {{ name }}
      </h1>
    </div>

    <button class="w-1/5 absolute bottom-40" v-if="ctaVisible" @click="click">
      <img class="w-full" src="/images/cta/toquer.svg" draggable="false" />
    </button>
  </View>
</template>