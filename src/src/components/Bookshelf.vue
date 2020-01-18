<template>
  <div>
    <mu-appbar style="width: 100%;position: fixed;top: 0;" title="书架" :z-depth="1" :color="$store.state.color">
         <span slot="left">
        <mu-icon value="menu" @click="is_drawer_show = !is_drawer_show"></mu-icon>
      </span>
    </mu-appbar>
    <div style="margin: 60px 0;">
      <mu-grid-list v-if="$store.state.books.length > 0">
        <mu-grid-tile v-for="(item,index) in $store.state.books" @click="toDetail(item)">
          <img src="./static/img/0_compressed.png" :style="{width:'100%',height:'100%'}">
          <span slot="title">{{item.book_name}}</span>
          <mu-button slot="action" icon>
            <mu-icon value="book"></mu-icon>
          </mu-button>
        </mu-grid-tile>
      </mu-grid-list>
    </div>
    <!-- 侧边菜单 -->
    <mu-drawer :open.sync="is_drawer_show" :docked="false" :style="{background:$store.state.drawer_bg_color}">
      <mu-list toggle-nested>
        <mu-list-item button nested :open="true">
          <mu-list-item-title>书源设置</mu-list-item-title>
          <mu-list-item-action>
            <mu-icon size="24" :value="'keyboard_arrow_down'"></mu-icon>
          </mu-list-item-action>
          <mu-list-item button :ripple="false" slot="nested" @click="changeSource">
            <mu-list-item-title>
              <mu-radio :label="'笔趣阁'" :value="$store.state.sources.biquge" v-model="$store.state.source"></mu-radio>
            </mu-list-item-title>
          </mu-list-item>
          <mu-list-item button :ripple="false" slot="nested" @click="changeSource">
            <mu-list-item-title>
              <mu-radio :label="'三七中文'" :value="$store.state.sources.sqzw" v-model="$store.state.source"></mu-radio>
            </mu-list-item-title>
          </mu-list-item>
          <mu-list-item button :ripple="false" slot="nested">
            <mu-list-item-title>
              <mu-radio :label="'有空再做'" :value="$store.state.sources.else" v-model="$store.state.source" disabled></mu-radio>
            </mu-list-item-title>
          </mu-list-item>
        </mu-list-item>
        <mu-list-item button nested :open="true">
          <mu-list-item-title>主题设置</mu-list-item-title>
          <mu-list-item-action>
            <mu-icon size="24" :value="'keyboard_arrow_down'"></mu-icon>
          </mu-list-item-action>
          <mu-list-item button :ripple="false" slot="nested" @click="changeColor">
            <mu-list-item-title>
              <mu-radio :label="'蓝'" :value="$store.state.colors.blue" v-model="$store.state.color"></mu-radio>
            </mu-list-item-title>
          </mu-list-item>
          <mu-list-item button :ripple="false" slot="nested" @click="changeColor">
            <mu-list-item-title>
              <mu-radio :label="'粉'" :value="$store.state.colors.pink" v-model="$store.state.color"></mu-radio>
            </mu-list-item-title>
          </mu-list-item>
          <mu-list-item button :ripple="false" slot="nested" @click="changeColor">
            <mu-list-item-title>
              <mu-radio :label="'绿'" :value="$store.state.colors.green" v-model="$store.state.color"></mu-radio>
            </mu-list-item-title>
          </mu-list-item>
          <mu-list-item button :ripple="false" slot="nested" @click="changeColor">
            <mu-list-item-title>
              <mu-radio :label="'黑'" :value="$store.state.colors.dark" v-model="$store.state.color"></mu-radio>
            </mu-list-item-title>
          </mu-list-item>
        </mu-list-item>
        <mu-list-item button @click="is_clear_cache_show = true">
          <mu-list-item-action>
            <mu-icon value="cached"></mu-icon>
          </mu-list-item-action>
          <mu-list-item-title>清除缓存 &ensp;&ensp;&ensp;&ensp;{{cacheSize+'KB'}}</mu-list-item-title>
        </mu-list-item>
      </mu-list>
    </mu-drawer>
    <mu-dialog title="确认清除？" width="360" :open.sync="is_clear_cache_show">
      清空书架和分类缓存
      <mu-button slot="actions" flat color="primary" @click="clearCache">确定</mu-button>
    </mu-dialog>
  </div>
</template>

<script>
    import Vue from 'vue'
    export default {
      data () {
        return {
          is_drawer_show: false,
          is_clear_cache_show: false,
          cacheSize: 0,
        }
      },
      methods: {
        getBooks () {
          this.$store.commit('setBooks', []);
          Object.keys(localStorage).forEach((v,i)=>{
            if (v.indexOf(this.$store.state.localstorage_keys.books.prefix) !== 0) return false
            try {
              let book = JSON.parse(Vue.localStorage.get(v))
              this.$store.commit('pushBook', book);

              // 去重
              let hash = {}
              this.$store.commit('setBooks', this.$store.state.books.reduce(function(item, next) {
                hash[next.book_url] ? '' : hash[next.book_url] = true && item.push(next)
                return item
              }, []));
            } catch (e) {

            }
          })
        },
        toDetail (book) {
          if (this.$store.state.is_loading) return false
          this.$router.push({
            path: '/detail?book_name='+book.book_name+'&book_url='+book.book_url,
          })
        },
        scrollToTop () {
          window.scroll(0, 0)
        },
        clearCache () {
          localStorage.clear()
          this.$store.commit('setBooks', []);
          this.$store.commit('setCategories', []);
          this.getCacheSize()
          this.is_clear_cache_show = false
        },
        // 缓存大小，单位KB
        getCacheSize () {
          let cacheSize = 0
          Object.keys(window.localStorage).forEach(function (v,i) {
            cacheSize += Vue.localStorage.get(v).length
          })
          this.cacheSize = (cacheSize/1024).toFixed(2)
        },
        // 切换小说源
        changeSource () {
          if (Vue.localStorage.get(this.$store.state.localstorage_keys.settings.prefix + this.$store.state.localstorage_keys.settings.source) === this.$store.state.source) return false
          localStorage.clear()
          this.$store.commit('setBooks', []);
          this.$store.commit('setCategories', []);
          Vue.localStorage.set(this.$store.state.localstorage_keys.settings.prefix + this.$store.state.localstorage_keys.settings.source,this.$store.state.source)
        },
        setSource () {
          this.$store.state.source = Vue.localStorage.get(this.$store.state.localstorage_keys.settings.prefix + this.$store.state.localstorage_keys.settings.source) || this.$store.state.source;
        },
        changeColor () {
          if (Vue.localStorage.get(this.$store.state.localstorage_keys.settings.prefix + this.$store.state.localstorage_keys.settings.color) === this.$store.state.color) return false
          Vue.localStorage.set(this.$store.state.localstorage_keys.settings.prefix + this.$store.state.localstorage_keys.settings.color,this.$store.state.color)
        },
        setColor () {
          this.$store.state.color = Vue.localStorage.get(this.$store.state.localstorage_keys.settings.prefix + this.$store.state.localstorage_keys.settings.color) || this.$store.state.color;
        },
      },
      mounted () {
        this.getBooks()
        this.setSource()
        this.setColor()
        this.scrollToTop()
        this.getCacheSize()
      },
    }
</script>

<style scoped>

</style>
