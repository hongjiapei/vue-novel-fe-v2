<template>
  <div>
    <mu-appbar style="width: 100%;position: fixed;top: 0;" title="搜索" :z-depth="1" :color="$store.state.color"></mu-appbar>
    <div style="marginTop: 120px; marginBottom: 80px; text-align: center;">
      <mu-text-field placeholder="请输入书名" v-model="keyword" @keyup.enter="getSearch"></mu-text-field>
      <mu-button @click="getSearch" :color="$store.state.color">搜索</mu-button>
      <br/>
      <mu-list>
        <mu-list-item button v-for="(item,index) in lists" :style="{marginTop:'6px',marginBottom:'10px'}" :to="'/detail?book_name='+item.book_name+'&book_url='+item.book_url">
          <mu-list-item-content>
            <mu-list-item-title>{{item.book_name}}</mu-list-item-title>
            <mu-list-item-sub-title>{{item.book_author}}</mu-list-item-sub-title>
          </mu-list-item-content>
        </mu-list-item>
      </mu-list>
    </div>
  </div>
</template>

<script>
    export default {
      data () {
        return {
          keyword: '',
          lists: [],
          cancel_request: null,
        }
      },
      methods: {
        getSearch () {
          if (!this.keyword || this.$store.state.is_loading) return false
          // 让搜索框blur，这样手机键盘会收回去
          document.getElementsByClassName('mu-text-field-input')[0].blur()
          this.$http.get('/novel/search?keyword='+this.keyword, {
            cancelToken: new this.$http.CancelToken( c => {this.cancel_request = c})
          }).then(res => {
            this.cancel_request = null
            this.lists = res.data
          }).catch(err => {
            this.$store.commit('toggleLoading', false);
            console.log(err)
          })

        },
        scrollToTop () {
          window.scroll(0, 0)
        }
      },
      mounted () {
        this.scrollToTop()
      },
      destroyed() {
        if (this.cancel_request) this.cancel_request();
      },
    }
</script>

<style scoped>

</style>
