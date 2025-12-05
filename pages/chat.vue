<template>
  <div class="page-container">
    <h1>Chat avec Amel Chabah</h1>
    <Chat />
  </div>
</template>

<script setup lang="ts">
import Chat from '~/components/Chat.vue'
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
