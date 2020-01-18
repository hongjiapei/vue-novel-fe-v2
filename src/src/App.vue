<template>
  <div>
    <looping-rhombuses-spinner
      :animation-duration="2000"
      :size="65"
      :color="$store.state.color"
      v-show="$store.state.is_loading"
      :style="loadingStyle"
    />
    <mu-snackbar :color="$store.state.color" :open.sync="$store.state.is_retry_show">
      {{$store.state.retry_text}}
    </mu-snackbar>
    <mu-snackbar :color="$store.state.color" :open.sync="$store.state.is_last_page">
      没有更多章节了
    </mu-snackbar>
    <router-view/>
  </div>
</template>

<script>
  import {LoopingRhombusesSpinner} from 'epic-spinners'
  export default {
    components: {
      LoopingRhombusesSpinner,
    },
    data () {
      return {
        loadingStyle: {
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 999,
        }
      }
    },
    methods: {

    },
    mounted () {

    },
  }
</script>

<style>
  html, body {
    width: 100%;
    height: 100%;
  }
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-bottom: 60px;
  }
  .mu-appbar-title {
    text-align: center;
  }
  .mu-card-actions {
    text-align: center;
  }
  .mu-raised-button {
    min-width: 60px;
  }
</style>
