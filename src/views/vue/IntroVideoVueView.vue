<script setup lang="ts">
import { ViewId } from '@/core/commons/constants/views/ViewId'
import { ViewsManager } from '@/core/commons/managers/ViewsManager'
import { ref } from 'vue'

const videoRef = ref<HTMLVideoElement | null>(null)

const onVideoEnded = () => {
  ViewsManager.Hide(ViewId.INTRO_VIDEO)
}
</script>

<template>
  <View>
    <div class="w-full h-full flex items-center justify-center">
      <video 
        class="w-full h-full object-cover"
        ref="videoRef"
        muted
        autoplay
        playsinline="true"
        src="/videos/intro2.mp4"
        @ended="onVideoEnded"
      />
    </div>
  </View>
</template>
