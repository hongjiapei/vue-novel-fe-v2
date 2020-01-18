<template>
  <div :style="footer_style">
    <mu-bottom-nav :value.sync="$store.state.navigator_value" :color="$store.state.color">
      <mu-bottom-nav-item title="书架" icon="restore" :to="navigator.bookshelf" :value="navigator.bookshelf"></mu-bottom-nav-item>
      <mu-bottom-nav-item title="分类" icon="list" :to="navigator.category" :value="navigator.category"></mu-bottom-nav-item>
      <mu-bottom-nav-item title="搜索" icon="search" :to="navigator.search" :value="navigator.search"></mu-bottom-nav-item>
    </mu-bottom-nav>
  </div>
</template>

<script>
    export default {
      data () {
        return {
          footer_style: {
            position: 'fixed',
            bottom: '0',
            width: '100%',
          },
          navigator: {
            bookshelf: '/bookshelf',
            category: '/category',
            search: '/search',
          }
        }
      },
      methods: {

      }
    }
</script>

<style>

</style>
