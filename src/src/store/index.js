import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    is_loading: false,
    retry_text: '加载失败，自动重试中...',
    is_retry_show: false,
    navigator_value: '/bookshelf',
    is_last_page: false,
    current_category_url: '',
    current_get_chapters_url: '',
    books: [],
    categories: [],

    localstorage_keys: {
        books: {
          prefix: 'books:',
        },
        settings: {
          prefix: 'settings:',
          source: 'source',
          color: 'color',
          dark: 'dark',
          font_size: 'font_size',
        },
        categories: {
          prefix: 'categories:',
          categories: 'categories',
        },
        lists: {
          prefix: 'lists:',
        },
        detail: {
          prefix: 'detail:',
        },
        chapters: {
          prefix: 'chapters:',
        },
    },
    source: '001',
    sources: {
      biquge: '001',
      sqzw: '002',
      else: '003',
    },
    color: '#00aadc',
    colors: {
      blue: '#00aadc',
      pink: '#dc72b5',
      dark: '#343233',
      green: '#2db47b',
    },
    night_color: '#343233',
    drawer_bg_color: 'rgba(240,240,240,1)',
  },
  mutations: {
    toggleLoading (state, val) {
      state.is_loading = val;
    },
    toggleRetry (state, val) {
      state.is_retry_show = val;
    },
    toggleIsLast (state, val) {
      state.is_last_page = val;
    },
    setRetryText (state, val) {
      state.retry_text = val;
    },
    setCurrentCategoryUrl (state, val) {
      state.current_category_url = val;
    },
    setCurrentGetChaptersUrl (state, val) {
      state.current_get_chapters_url = val;
    },
    setBooks (state, val) {
      state.books = val;
    },
    pushBook (state, val) {
      state.books.push(val);
    },
    setCategories (state, val) {
      state.categories = val;
    },
  },
  actions: {

  },
});
