<template>
    <div>
      <mu-appbar style="width: 100%;position: fixed;top: 0;" title="分类" :z-depth="1" :color="$store.state.color"></mu-appbar>
      <div style="margin: 60px 0;">
        <mu-list>
          <mu-list-item :to="'/lists?category_name='+item.category_name+'&category_url='+item.category_url" button v-for="(item,index) in $store.state.categories">
            <mu-list-item-title :style="{textAlign: 'center'}">{{item.category_name}}</mu-list-item-title>
          </mu-list-item>
        </mu-list>
      </div>

    </div>
</template>

<script>
    import Vue from 'vue'
    export default {
      data () {
        return {
          cancel_request: null,
        }
      },
      methods: {
        getCategories () {
          this.$http.get('/novel/categories', {
            cancelToken: new this.$http.CancelToken( c => {this.cancel_request = c})
          }).then(res => {
              this.cancel_request = null
              this.$store.commit('setCategories', res.data);
              this.setCategories(res.data)
          }).catch(err => {
              this.$store.commit('toggleLoading', false);
              console.log(err)
          })
        },
        // 小说分类存入localStorage，过期时间10天
        setCategories (categories=[],expire=864000) {
          let tmp = {
            expire_time:Date.parse(new Date())/1000+expire,
            categories: categories
          }
          Vue.localStorage.set(this.$store.state.localstorage_keys.categories.prefix + this.$store.state.localstorage_keys.categories.categories,JSON.stringify(tmp))
        },
        scrollToTop () {
          window.scroll(0, 0)
        },
        clearCategoryUrl () {
          this.$store.commit('setCurrentCategoryUrl', '');
        },
        getCategoriesFromCache () {
          // 读取小说分类，缓存没过期直接用，过期了重新获取并设置缓存
          let categories = Vue.localStorage.get(this.$store.state.localstorage_keys.categories.prefix + this.$store.state.localstorage_keys.categories.categories)
          if (categories) {
            categories = JSON.parse(categories)
            if (categories.expire_time < Date.parse(new Date())/1000) {
              this.getCategories()
            } else {
              this.$store.commit('setCategories', categories.categories);
            }
          } else {
            this.getCategories()
          }
        },
      },
      mounted () {
        this.getCategoriesFromCache()
        this.clearCategoryUrl()
        this.scrollToTop()
      },
      destroyed() {
        if (this.cancel_request) this.cancel_request();
      },
    }
</script>

<style scoped>

</style>
