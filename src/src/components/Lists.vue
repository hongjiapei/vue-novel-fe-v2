<template>
  <div>
    <mu-appbar style="width: 100%;position: fixed;top: 0;" :title="category_name" :color="$store.state.color">
      <span slot="left">
        <mu-icon value="navigate_before" @click="goBack"></mu-icon>
      </span>
    </mu-appbar>
    <div style="margin: 60px 6%" v-if="lists.length > 0">
      <mu-list>
        <mu-list-item button v-for="(item,index) in lists" :style="{marginTop:'6px',marginBottom:'10px'}" @click="toDetail(item)">
          <mu-list-item-content>
            <mu-list-item-title>{{item.book_name}}</mu-list-item-title>
            <mu-list-item-sub-title>{{item.book_author}}</mu-list-item-sub-title>
          </mu-list-item-content>
        </mu-list-item>
      </mu-list>
      <mu-row gutter>
        <mu-col span="2" @click="changePage(first_url)"><mu-button small :disabled="category_url === first_url" :color="$store.state.color">首页</mu-button></mu-col>
        <mu-col span="2" offset="1" @click="changePage(prev_url)"><mu-button small :disabled="category_url === prev_url" :color="$store.state.color">上页</mu-button></mu-col>
        <mu-col span="2" offset="1" @click="changePage(next_url)"><mu-button small :disabled="category_url === next_url" :color="$store.state.color">下页</mu-button></mu-col>
        <mu-col span="2" offset="1" @click="changePage(last_url)"><mu-button small :disabled="category_url === last_url" :color="$store.state.color">尾页</mu-button></mu-col>
      </mu-row>
    </div>
  </div>
</template>

<script>
    import Vue from 'vue'
    export default {
      data () {
        return {
          category_name: '',
          category_url: '',
          lists: [],
          first_url: '',
          prev_url: '',
          next_url: '',
          last_url: '',
          cancel_request: null,
        }
      },
      methods: {
        getLists (website) {
          if (this.$store.state.is_loading) return false
          this.$http.get('/novel/lists?website='+website, {
            cancelToken: new this.$http.CancelToken( c => {this.cancel_request = c})
          }).then(res => {
            this.cancel_request = null
            this.lists = res.data
            this.category_url = website
            if (this.lists.length > 0) {
              if (this.lists[0].hasOwnProperty('first_url')) {
                this.first_url = this.lists[0].first_url
              } else {
                this.first_url = this.category_url
              }
              if (this.lists[0].hasOwnProperty('prev_url')) {
                this.prev_url = this.lists[0].prev_url
              } else {
                this.prev_url = this.category_url
              }
              if (this.lists[0].hasOwnProperty('next_url')) {
                this.next_url = this.lists[0].next_url
              } else {
                this.next_url = this.category_url
              }
              if (this.lists[0].hasOwnProperty('last_url')) {
                this.last_url = this.lists[0].last_url
              } else {
                this.last_url = this.category_url
              }
            }
            this.setLists({
              lists: this.lists,
              category_url: this.category_url,
              first_url: this.first_url,
              prev_url: this.prev_url,
              next_url: this.next_url,
              last_url: this.last_url,
            });
          }).catch(err => {
            this.$store.commit('toggleLoading', false);
            console.log(err)
          })
        },
        goBack () {
          if (this.cancel_request) this.cancel_request();
          this.$router.back()
        },
        changePage (url) {
          if (url === this.category_url) return false
          this.getListsFromCache(url)
        },
        scrollToTop () {
          window.scroll(0, 0)
        },
        setCategoryUrl () {
          this.$store.commit('setCurrentCategoryUrl', this.category_url);
        },
        toDetail (book) {
          if (this.$store.state.is_loading) return false
          this.$router.push({
            path: '/detail?book_name='+book.book_name+'&book_url='+book.book_url,
          })
        },
        setLists (lists,expire=864000) {
          let tmp = {
            expire_time:Date.parse(new Date())/1000+expire,
            lists: lists.lists,
            category_url: lists.category_url,
            first_url: lists.first_url,
            prev_url: lists.prev_url,
            next_url: lists.next_url,
            last_url: lists.last_url,
          }
          Vue.localStorage.set(this.$store.state.localstorage_keys.lists.prefix + this.category_url,JSON.stringify(tmp))
        },
        getListsFromCache (category_url) {
          let lists = Vue.localStorage.get(this.$store.state.localstorage_keys.lists.prefix + category_url)
          if (lists) {
            lists = JSON.parse(lists)
            if (lists.expire_time < Date.parse(new Date())/1000) {
              this.getLists(category_url)
            } else {
              this.lists = lists.lists;
              this.category_url = lists.category_url;
              this.first_url = lists.first_url;
              this.prev_url = lists.prev_url;
              this.next_url = lists.next_url;
              this.last_url = lists.last_url;
            }
          } else {
            this.getLists(category_url)
          }
        },
      },
      mounted () {
        if (this.$store.state.cancel_request)  this.$store.state.cancel_request();
        this.category_name = this.$route.query.category_name
        this.category_url = this.$store.state.current_category_url || this.$route.query.category_url
        this.getListsFromCache(this.category_url);
      },
      destroyed() {
        if (this.cancel_request) this.cancel_request();
      },
      watch: {
        'lists': 'scrollToTop',
        'category_url': 'setCategoryUrl',
      }
    }
</script>

<style scoped>

</style>
