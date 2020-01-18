<template>
  <div>
    <mu-appbar style="width: 100%;position: fixed;top: 0;" :title="book_name" :color="$store.state.color">
      <span slot="left">
        <mu-icon value="navigate_before" @click="goBack"></mu-icon>
      </span>
      <mu-button flat slot="right" :to="'/'" color="rgba(0,0,0,0.54)">
        <mu-icon value="home" :color="'#fff'"></mu-icon>
      </mu-button>
    </mu-appbar>
    <div style="margin-top: 60px;" v-if="book_description">
      <mu-card style="width: 100%; max-width: 1080px; margin: 0 auto; background-color: #fafafa;">
        <mu-card-text v-html="book_description"></mu-card-text>
        <mu-card-actions></mu-card-actions>
        <mu-card-actions></mu-card-actions>
        <mu-card-actions></mu-card-actions>
        <mu-card-actions></mu-card-actions>
        <mu-card-actions>
          <mu-button flat :to="'/chapters?book_url='+book_url+'&book_name='+book_name+'&get_chapters_url='+get_chapters_url">查看目录</mu-button>
        </mu-card-actions>
        <mu-card-actions v-if="book && book.hasOwnProperty('get_chapter_detail_url')">
          <mu-button flat :to="'/chapter/detail?book_url='+book_url+'&book_name='+book_name+'&get_chapter_detail_url='+book.get_chapter_detail_url">继续上次阅读</mu-button>
        </mu-card-actions>
        <mu-card-actions>
          <mu-button flat @click="toggleSaveBook">{{show_text}}</mu-button>
        </mu-card-actions>
      </mu-card>
    </div>
  </div>
</template>

<script>
    import Vue from 'vue'
    export default {
      data () {
        return {
          book: {},
          book_url: '',
          book_name: '',
          book_description: '',
          get_chapters_url: '',
          is_show: false,
          show_text: '',
          cancel_request: null,
        }
      },
      methods: {
        getDetail (website) {
          if (this.$store.state.is_loading) return false
          this.$http.get('/novel/detail?website='+website, {
            cancelToken: new this.$http.CancelToken( c => {this.cancel_request = c})
          }).then(res => {
            this.cancel_request = null
            this.book_description = res.data.book_description
            this.get_chapters_url = res.data.get_chapters_url
            this.setDetail({book_description: this.book_description, get_chapters_url: this.get_chapters_url});
          }).catch(err => {
            this.$store.commit('toggleLoading', false);
            console.log(err)
          })
        },
        goBack () {
          if (this.cancel_request) this.cancel_request();
          this.$router.back()
        },
        toggleSaveBook () {
          if (Vue.localStorage.get(this.$store.state.localstorage_keys.books.prefix + this.book_url)) {
            Vue.localStorage.remove(this.$store.state.localstorage_keys.books.prefix + this.book_url)
            this.show_text = '加入书架'
            return false
          }
          let book = {book_name: this.book_name, book_url: this.book_url}
          book = JSON.stringify(book)
          Vue.localStorage.set(this.$store.state.localstorage_keys.books.prefix + this.book_url,book)
          this.show_text = '从书架删除'
        },
        scrollToTop () {
          window.scroll(0, 0)
        },
        clearGetChaptersUrl () {
          this.$store.commit('setCurrentGetChaptersUrl', '');
        },
        setDetail (detail,expire=864000) {
          let tmp = {
            expire_time:Date.parse(new Date())/1000+expire,
            book_description: detail.book_description,
            get_chapters_url: detail.get_chapters_url,
          }
          Vue.localStorage.set(this.$store.state.localstorage_keys.detail.prefix + this.book_url,JSON.stringify(tmp))
        },
        getDetailFromCache (book_url) {
          let detail = Vue.localStorage.get(this.$store.state.localstorage_keys.detail.prefix + book_url)
          if (detail) {
            detail = JSON.parse(detail)
            if (detail.expire_time < Date.parse(new Date())/1000) {
              this.getDetail(book_url)
            } else {
              this.book_description = detail.book_description
              this.get_chapters_url = detail.get_chapters_url
            }
          } else {
            this.getDetail(book_url)
          }
        },
      },
      mounted () {
        this.book_url = this.$route.query.book_url
        this.book_name = this.$route.query.book_name
        this.show_text = Vue.localStorage.get(this.$store.state.localstorage_keys.books.prefix + this.book_url) ? '从书架删除' : '加入书架'

        this.getDetailFromCache(this.book_url)

        let book = Vue.localStorage.get(this.$store.state.localstorage_keys.books.prefix + this.book_url)
        if (book) {
          this.book = JSON.parse(book)
        }
        this.clearGetChaptersUrl()
        this.scrollToTop()
      },
      destroyed() {
        if (this.cancel_request) this.cancel_request();
      },
    }
</script>

<style scoped>

</style>
