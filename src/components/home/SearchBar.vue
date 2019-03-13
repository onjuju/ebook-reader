<template>
  <div>
    <div class="search-bar" :class="{'hide-title': !titleVisible, 'hide-shadow': !shadowVisible}">
      <transition name="title-move">
        <div class="search-bar-title-wrapper" v-show="titleVisible">
          <div class="title-text-wrapper title">
            <span class="title-text">{{$t('home.title')}}</span>
          </div>
          <div class="title-icon-shake-wrapper" @click="showFlapCard">
            <span class="icon-shake icon"></span>
          </div>
        </div>
      </transition>
      <div class="title-icon-back-wrapper" :class="{'hide-title': !titleVisible}" @click="back">
        <span class="icon-back icon"></span>
      </div>
      <div class="search-bar-input-wrapper" :class="{'hide-title': !titleVisible}">
        <div class="search-bar-blank" :class="{'hide-title': !titleVisible}"></div>
        <div class="search-bar-input">
          <span class="icon-search icon"></span>
          <input type="text" class="input" :placeholder="$t('home.hint')" v-model="searchText" @click="showHotSearch" @keyup.13.exact="search" />
        </div>
      </div>
    </div>  
    <hot-search-list v-show="hotSearchVisible" ref="searchList"></hot-search-list>
  </div>
</template>

<script>
import { storeHomeMixin } from '@/utils/mixin'
import HotSearchList from '@/components/home/HotSearchList'
export default {
  mixins: [storeHomeMixin],
  components: {
    HotSearchList
  },
  data () {
    return {
      searchText: '',
      titleVisible: true,
      shadowVisible: false,
      hotSearchVisible: false
    }
  },
  methods: {
    search () {
      this.$router.push({
        path: '/store/list',
        query: {
          keyword: this.searchText
        }
      })
    },
    showFlapCard () {
      this.setFlapCardVisible(true)
    },
    back () {
      if (this.offsetY > 0) {
        this.showShadow()
      } else {
        this.hideShadow()
      }
      if (this.hotSearchVisible) {
        this.hideHotSearch()        
      } else {
        this.$router.push({
          path: '/store/shelf'
        })
      }
    },
    hideHotSearch () {
      this.hotSearchVisible = false
      if (this.offsetY > 0) {
        this.hideTitle()
      } else {
        this.showTitle()
      }
    },
    showHotSearch () {
      this.hideTitle()
      this.hideShadow()
      this.hotSearchVisible = true
      this.$nextTick(() => {
        this.$refs['searchList'].reset()
      })
    },
    hideTitle () {
      this.titleVisible = false
    },
    showTitle () {
      this.titleVisible = true
    },
    showShadow () { 
      this.shadowVisible = true
    },
    hideShadow () {
      this.shadowVisible = false
    }
  },
  watch: {
    offsetY (offsetY) {
      if (offsetY > 0) {
        this.hideTitle()
        this.showShadow()
      } else if (offsetY === 0) {
        this.showTitle()
        this.hideShadow()
      }
    },
    hotSearchOffsetY (offsetY) {
      if (offsetY > 0) {
        this.showShadow()
      } else {
        this.hideShadow()
      }
    }
  }
}
</script>

<style lang='scss' scoped>
  @import "../../assets/styles/global";
  .search-bar {
    width: 100%;
    height: px2rem(94);
    z-index: 150;
    position: relative;
    box-shadow: 0 px2rem(2) px2rem(2) 0 rgba(0, 0, 0, .1);
    transition: height .2s linear;
    &.hide-title {
      height: px2rem(52);
    }
    &.hide-shadow {
      box-shadow: none;
    }
    .search-bar-title-wrapper {
      width: 100%;
      height: px2rem(42);
      position: absolute;
      top: 0;
      left: 0;
      .title-text-wrapper {
        height: px2rem(42);
        @include center;
      }
      .title-icon-shake-wrapper {
        position: absolute;
        top: 0;
        right: px2rem(15);
        height: px2rem(42);
        @include center;
      }
    }
    .title-icon-back-wrapper {
      position: absolute;
      top: 0;
      left: px2rem(15);
      height: px2rem(42);
      transition: all $animationTime $animationType;
      z-index: 200;
      @include center;
      &.hide-title {
        height: px2rem(52);
      }
    }
    .search-bar-input-wrapper {
      display: flex;
      width: 100%;
      height: px2rem(52);
      padding: px2rem(10);
      position: absolute;
      left: 0;
      top: px2rem(42);
      box-sizing: border-box;
      transition: top $animationTime $animationType;
      &.hide-title {
        top: 0;
      }
      .search-bar-blank {
        flex: 0 0 0;
        width: 0;
        transition: all $animationTime $animationType;
        &.hide-title {
          flex: 0 0 px2rem(31);
          width: px2rem(31);
        }
      }
      .search-bar-input {
        flex: 1;
        width: 100%;
        background: #f4f4f4;
        border-radius: px2rem(20);
        padding: px2rem(5) px2rem(16);
        box-sizing: border-box;
        border: px2rem(1) solid #eee;
        @include left;
        .icon-search {
          color: #999;
        }
        .input {
          width: 100%;
          height: px2rem(22);
          border: none;
          background: transparent;
          margin-left: px2rem(10);
          font-size: px2rem(12);
          &:focus {
            outline: none;
          }
          &::-webkit-input-placeholder {
            color: #ccc;
          }
        }
      }
    }
  }
</style>