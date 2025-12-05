<script setup lang="ts">
  
</script>

<template>
  <View class="view-wrapper">
    <div class="dialog-wrapper">
      <svg class="bg-svg" viewBox="0 0 945 223" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0L554.404 22.1615L945 12.0041L931.375 223L321.56 207.764L9.08363 210.303L0 0Z" fill="#EFEFEF"/>
      </svg>


      <div class="dialog-container">
        <span class="name">
          Sam
        </span>
        <div class="text-container">
          <p>
            Sit labore aliqua sint duis consequat veniam aute excepteur ipsum irure id fugiat aute ut. Commodo dolor et consectetur non proident amet voluptate ex duis irure quis nisi aute laborum. Et enim reprehenderit non magna ullamco adipisicing ea velit ullamco. Cupidatat officia officia nostrud exercitation consectetur consectetur. Cupidatat occaecat proident ex occaecat commodo ex 
          </p>
        </div>
        <button class="arrow-btn">
          <svg viewBox="0 0 34 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.39663 8.06854L13.5975 20.2893C15.4347 22.1295 18.4024 22.1295 20.2396 20.2893L32.4405 8.06854C35.4083 5.09592 33.2884 0 29.0959 0H4.69416C0.501587 0 -1.57114 5.09592 1.39663 8.06854Z" fill="#FFB101"/>
          </svg>
        </button>
      </div>
    </div>
  </View>
</template>

<style scoped lang="scss">
  .view-wrapper {
    position: absolute;
    top: 100svh;
    left: 50%;
    height: fit-content;

    transform: translateY(-100%);

    padding-bottom: 30px;
  }

  .dialog-wrapper {
    position: relative;

    transform: translateX(-50%);

    width: 60svw;
    max-width: 800px;
    aspect-ratio: 4.2376681614;
  }

  .name {
    position: relative;
    font-size: 1.25vw;
  }

  .text-container {
    font-size: 1.05vw;
    line-height: 1.3;
    flex: 1;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .dialog-container {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    width: 100%;
    height: 100%;

    padding: 3% 5%;
    padding-bottom: 4%;

    outline: 1px solid blue;
  }

  .arrow-btn {
    cursor: pointer;
    position: absolute;
    right: 0;
    bottom: 0;
    width: 1.5vw;

    transform: translate(-100%, -50%);

    svg {
      animation: 1s pd linear infinite;
      --translate: 12%;

      @keyframes pd {
        0% {
          transform: translateY(0%);    
        }

        25% {
          transform: translateY(var(--translate));
        }

        50% {
          transform: translateY(0%);
        }

        75% {
          transform: translateY(calc(-1 * var(--translate)));
        }

        100% {
          transform: translateY(0%);
        }
      }
    }
  }

  .bg-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>