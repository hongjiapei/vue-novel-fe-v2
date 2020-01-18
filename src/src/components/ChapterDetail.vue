<template>
    <div>
      <mu-appbar style="width: 100%;position: fixed;top: 0;" :title="book_name" :color="$store.state.color" :style="{background:is_dark ? $store.state.night_color: $store.state.color}">
        <span slot="left">
          <mu-icon value="navigate_before" @click="goBack"></mu-icon>
        </span>
        <mu-button flat slot="right" :to="'/'" color="rgba(0,0,0,0.54)">
          <mu-icon value="home" :color="'#fff'"></mu-icon>
        </mu-button>
      </mu-appbar>
      <div style="margin: 58px 0;" v-if="chapter_content" @click="operate('','',$event)">
        <mu-card :style="{width: '100%',maxWidth: '1080px', margin: '0 auto'}">
          <mu-card-text v-html="chapter_name" :style="{textAlign:'center',background:is_dark ? $store.state.night_color: '#fff', color:is_dark ? '#ccc': '#000',fontSize:font_size+'px',}"></mu-card-text>
          <mu-card-text v-html="chapter_content" :style="{textAlign: 'left',background:is_dark ? $store.state.night_color: '#fff', color:is_dark ? '#ccc': '#000',fontSize:font_size+'px',}"></mu-card-text>
        </mu-card>
      </div>
      <mu-appbar :color="$store.state.color" :style="{width: '100%',position: 'fixed',bottom: 0,background:is_dark ? $store.state.night_color: $store.state.color}">
        <mu-row gutter>
          <mu-col span="4"><mu-button flat :disabled="prev_url === get_chapters_url" @click="changePage(prev_url)">上页</mu-button></mu-col>
          <mu-col span="4"><mu-button flat :to="'/chapters?book_name='+book_name+'&get_chapters_url='+get_chapters_url">目录</mu-button></mu-col>
          <mu-col span="4"><mu-button flat :disabled="next_url === get_chapters_url" @click="changePage(next_url)">下页</mu-button></mu-col>
        </mu-row>
      </mu-appbar>
      <!-- 设置选项 -->
      <mu-appbar class="operation" :color="$store.state.night_color" v-show="is_operation_show">
        <mu-list>
          <mu-sub-header>设置</mu-sub-header>
          <mu-list-item button>
            <mu-list-item-action>
              <mu-icon value="brightness_2" color="orange"></mu-icon>
            </mu-list-item-action>
            <mu-list-item-title>
              <mu-switch v-model="is_dark"></mu-switch>
            </mu-list-item-title>
          </mu-list-item>
          <mu-list-item button>
            <mu-list-item-action>
              <mu-icon value="font_download" color="cyan"></mu-icon>
            </mu-list-item-action>
            <mu-list-item-title>
              <mu-radio :value="14" v-model="font_size" :label="'14'" style="padding: 0 8px;"></mu-radio>
              <mu-radio :value="16" v-model="font_size" :label="'16'" style="padding: 0 8px;"></mu-radio>
              <mu-radio :value="18" v-model="font_size" :label="'18'" style="padding: 0 8px;"></mu-radio>
            </mu-list-item-title>
          </mu-list-item>
        </mu-list>
      </mu-appbar>
    </div>
</template>

<script>
    import Vue from 'vue'
    export default {
      data () {
        return {
          book_url: '',
          book_name: '',
          chapter_name: '',
          chapter_content: '',
          get_chapter_detail_url: '',
          prev_url: '',
          next_url: '',
          get_chapters_url: '',
          is_operation_show: false,
          is_dark: false,
          font_size: 14,
          cancel_request: null,
        }
      },
      methods: {
        getChapterDetail (website) {
          if (this.$store.state.is_loading) return false
          this.$http.get('/novel/chapterDetail?website='+website, {
            cancelToken: new this.$http.CancelToken( c => {this.cancel_request = c})
          }).then(res => {
            this.cancel_request = null
            this.get_chapter_detail_url = website
            this.chapter_name = res.data.chapter_name
            this.chapter_content = res.data.chapter_content
            this.prev_url = res.data.prev_url
            this.next_url = res.data.next_url
            this.get_chapters_url = res.data.get_chapters_url
            this.saveReading();
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
          this.getChapterDetail(url)
        },
        scrollToTop () {
          window.scroll(0,0)
        },

        // 点击中间弹出设置选项,点击右边下一章,点击左边上一章
        operate (param1,param2,$event) {
          let x = $event.pageX
          let y = $event.pageY - window.scrollY
          if (this.isClickCenter(x,y)) {
            this.is_operation_show = !this.is_operation_show
          } else if (this.isClickLeft(x)) {
            if (this.$store.state.is_loading) return false
            // 判断是否是首页
            if (this.prev_url === this.get_chapters_url) {
              this.$store.state.is_last_page = true
              setTimeout(() => {
                this.$store.state.is_last_page = false
              },1000)
            } else {
              this.changePage(this.prev_url)
            }

          } else if (this.isClickRight(x)) {
            if (this.$store.state.is_loading) return false
            // 判断是否是尾页
            if (this.next_url === this.get_chapters_url) {
              this.$store.state.is_last_page = true
              setTimeout(() => {
                this.$store.state.is_last_page = false
              },1000)
            } else {
              this.changePage(this.next_url)
            }
          }
        },
        // 夜间模式
        setDark () {
          Vue.localStorage.set(this.$store.state.localstorage_keys.settings.prefix + this.$store.state.localstorage_keys.settings.dark,this.is_dark ? 1 : 0)
        },
        // 字体大小
        setFontSize () {
          Vue.localStorage.set(this.$store.state.localstorage_keys.settings.prefix + this.$store.state.localstorage_keys.settings.font_size,this.font_size)
        },
        isClickCenter (x,y) {
          let centerX = window.innerWidth / 2
          let centerY = window.innerHeight / 2
          let isXCenter = ( x < (centerX+40) ) && ( x > (centerX-40) )
          let isYCenter = ( y < (centerY+100) ) && ( y > (centerY-100) )
          return isXCenter && isYCenter
        },
        isClickLeft (x) {
          let leftBoundary = 0
          let rightBoundary = window.innerWidth / 4
          return ( x < rightBoundary ) && ( x > leftBoundary )
        },
        isClickRight (x) {
          let leftBoundary = window.innerWidth / 2 + window.innerWidth / 4
          let rightBoundary = window.innerWidth
          return ( x < rightBoundary ) && ( x > leftBoundary )
        },
        // 保存上次阅读进度
        saveReading () {
          let book = Vue.localStorage.get(this.$store.state.localstorage_keys.books.prefix + this.book_url)
          if (book) {
            book = JSON.parse(book)
            book.get_chapter_detail_url = this.get_chapter_detail_url
            book = JSON.stringify(book)
            Vue.localStorage.set(this.$store.state.localstorage_keys.books.prefix + this.book_url, book)
          }
        }
      },
      watch: {
        'chapter_name': 'scrollToTop', //切换章节时回滚到顶部
        'is_dark': 'setDark',
        'font_size': 'setFontSize',
      },
      mounted () {
        this.book_url = this.$route.query.book_url
        this.book_name = this.$route.query.book_name
        this.get_chapter_detail_url = this.$route.query.get_chapter_detail_url
        this.getChapterDetail(this.get_chapter_detail_url)
        // 夜间模式
        let isDark = Vue.localStorage.get(this.$store.state.localstorage_keys.settings.prefix + this.$store.state.localstorage_keys.settings.dark)
        if (Number(isDark) !== 0) this.is_dark = true
        // 字体大小
        let fontSize = Vue.localStorage.get(this.$store.state.localstorage_keys.settings.prefix + this.$store.state.localstorage_keys.settings.font_size)
        if (fontSize)  this.font_size = Number(fontSize)
      },
      destroyed () {
        this.saveReading();
        if (this.cancel_request) this.cancel_request();
      },
    }
</script>

<style>
  .operation {
    width: 100%;
    position: fixed;
    bottom: 0;
    height: auto;
    z-index: 9999;
  }
  .operation .mu-sub-header {
    color: #fff;
  }
  .operation .mu-item {
    color: #fff;
  }
  .operation .mu-radio-label {
    color: #fff;
  }
</style>
