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
      <div style="margin: 60px 4%" v-if="chapters.length > 0">
        <mu-list>
          <mu-list-item button v-for="(item,index) in chapters" :style="{marginTop:'6px',marginBottom:'10px'}" @click="toChapterDetail(book_url, book_name, item.get_chapterDetail_url)">
            <mu-list-item-title>{{item.chapter_name}}</mu-list-item-title>
            <mu-list-item-action>
              <mu-icon value="navigate_next"></mu-icon>
            </mu-list-item-action>
          </mu-list-item>
        </mu-list>
        <mu-row gutter>
          <mu-col span="2"><mu-button small :disabled="get_chapters_url === first_url" @click="changePage(first_url)" :color="$store.state.color">首页</mu-button></mu-col>
          <mu-col span="2" offset="1"><mu-button small :disabled="get_chapters_url === prev_url" @click="changePage(prev_url)" :color="$store.state.color">上页</mu-button></mu-col>
          <mu-col span="2" offset="1"><mu-button small :disabled="get_chapters_url === next_url" @click="changePage(next_url)" :color="$store.state.color">下页</mu-button></mu-col>
          <mu-col span="2" offset="1"><mu-button small :disabled="get_chapters_url === last_url" @click="changePage(last_url)" :color="$store.state.color">尾页</mu-button></mu-col>
        </mu-row>
      </div>
    </div>
</template>

<script>
    import Vue from 'vue'
    export default {
      data () {
        return {
          book_url: '',
          book_name: '',
          get_chapters_url: '',
          chapters: [],
          first_url: '',
          prev_url: '',
          next_url: '',
          last_url: '',
          cancel_request: null,
        }
      },
      methods: {
        getChapters (website) {
          if (this.$store.state.is_loading) return false
          this.$http.get('/novel/chapters?website='+website, {
            cancelToken: new this.$http.CancelToken( c => {this.cancel_request = c})
          }).then(res => {
            this.cancel_request = null
            this.get_chapters_url = website
            this.chapters = res.data
            if (this.chapters.length > 0) {
              if (this.chapters[0].hasOwnProperty('first_url')) {
                this.first_url = this.chapters[0].first_url
              } else {
                this.first_url = this.get_chapters_url
              }
              if (this.chapters[0].hasOwnProperty('prev_url')) {
                this.prev_url = this.chapters[0].prev_url
              } else {
                this.prev_url = this.get_chapters_url
              }
              if (this.chapters[0].hasOwnProperty('next_url')) {
                this.next_url = this.chapters[0].next_url
              } else {
                this.next_url = this.get_chapters_url
              }
              if (this.chapters[0].hasOwnProperty('last_url')) {
                this.last_url = this.chapters[0].last_url
              } else {
                this.last_url = this.get_chapters_url
              }
            }
            this.setChapters({
              chapters: this.chapters,
              get_chapters_url: this.get_chapters_url,
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
          this.getChaptersFromCache(url)
        },
        scrollToTop () {
          window.scroll(0, 0)
        },
        setGetChaptersUrl () {
          this.$store.commit('setCurrentGetChaptersUrl', this.get_chapters_url);
        },
        toChapterDetail (book_url, book_name, get_chapter_detail_url) {
          if (this.$store.state.is_loading) return false
          this.$router.push({
            path: '/chapter/detail?book_url='+book_url+'&book_name='+book_name+'&get_chapter_detail_url='+get_chapter_detail_url,
          })
        },
        setChapters (chapters,expire=864000) {
          let tmp = {
            expire_time:Date.parse(new Date())/1000+expire,
            chapters: chapters.chapters,
            get_chapters_url: chapters.get_chapters_url,
            first_url: chapters.first_url,
            prev_url: chapters.prev_url,
            next_url: chapters.next_url,
            last_url: chapters.last_url,
          }
          Vue.localStorage.set(this.$store.state.localstorage_keys.chapters.prefix + chapters.get_chapters_url,JSON.stringify(tmp))
        },
        getChaptersFromCache (get_chapters_url) {
          let chapters = Vue.localStorage.get(this.$store.state.localstorage_keys.chapters.prefix + get_chapters_url)
          if (chapters) {
            chapters = JSON.parse(chapters)
            if (chapters.expire_time < Date.parse(new Date())/1000) {
              this.getChapters(get_chapters_url)
            } else {
              this.chapters = chapters.chapters;
              this.get_chapters_url = chapters.get_chapters_url;
              this.first_url = chapters.first_url;
              this.prev_url = chapters.prev_url;
              this.next_url = chapters.next_url;
              this.last_url = chapters.last_url;
            }
          } else {
            this.getChapters(get_chapters_url)
          }
        },
      },
      mounted () {
        this.book_url = this.$route.query.book_url
        this.book_name = this.$route.query.book_name
        this.get_chapters_url = this.$store.state.current_get_chapters_url || this.$route.query.get_chapters_url

        this.getChaptersFromCache(this.get_chapters_url)
      },
      destroyed() {
        if (this.cancel_request) this.cancel_request();
      },
      watch:{
        'chapters': 'scrollToTop',
        'get_chapters_url': 'setGetChaptersUrl',
      }
    }
</script>

<style scoped>

</style>
