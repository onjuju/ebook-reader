<template>
  <div class="store-shelf">
    <shelf-title :title="$t('shelf.title')"></shelf-title>
    <scroll class="store-shelf-scroll-wrapper" :top="0" @onScroll="onScroll" :bottom="isEditMode? 48 : 0">
      <shelf-search></shelf-search>
      <shelf-list :data="shelfList"></shelf-list>
    </scroll>
    <shelf-footer></shelf-footer>
  </div>
</template>

<script>
import ShelfTitle from '@/components/shelf/ShelfTitle'
import ShelfSearch from '@/components/shelf/ShelfSearch'
import ShelfList from '@/components/shelf/ShelfList'
import ShelfFooter from '@/components/shelf/ShelfFooter'
import Scroll from '@/components/common/Scroll'
import { storeShelfMixin } from '@/utils/mixin'

export default {
  mixins: [storeShelfMixin],
  data () {
    return {
      scrollBottom: 0
    }
  },
  watch: {
    isEditMode (v) {
      if (v) {
        this.scrollBottom = 48
      } else {
        this.scrollBottom = 0
      }
    }
  },
  components: {
    ShelfTitle,
    Scroll,
    ShelfList,
    ShelfSearch,
    ShelfFooter
  },
  methods: {
    onScroll (offsetY) {
      this.setOffsetY(offsetY)
    }
  },
  mounted () {
    this.getShelfList()
    this.setShelfCategory([])
    this.setCurrentType(1)
  }
}
</script>

<style lang='scss' scoped>
  @import "../../assets/styles/global";
  .store-shelf {
    position: relative;
    z-index: 100;
    width: 100%;
    height: 100%;
    background: #fff;
    .store-shelf-scroll-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 101;
    }
  }

</style>