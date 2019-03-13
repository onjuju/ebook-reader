<template>
  <div class="store-shelf">
    <shelf-title :title="shelfCategory.title"></shelf-title>
    <scroll 
      class="store-shelf-scroll-wrapper" 
      :top="0" @onScroll="onScroll" 
      :bottom="isEditMode? 48 : 0" 
      v-if="ifShowList"
    >
      <shelf-list :top="42" :data="shelfCategory.itemList"></shelf-list>
    </scroll>
    <div class="store-shelf-empty-view" v-else>
      {{$t('shelf.groupNone')}}
    </div>
    <shelf-footer></shelf-footer>
  </div>
</template>

<script>
import ShelfTitle from '@/components/shelf/ShelfTitle'
import ShelfList from '@/components/shelf/ShelfList'
import ShelfFooter from '@/components/shelf/ShelfFooter'
import Scroll from '@/components/common/Scroll'
import { storeShelfMixin } from '@/utils/mixin'

export default {
  mixins: [storeShelfMixin],
  computed: {
    ifShowList () {
      return this.shelfCategory && this.shelfCategory.itemList && this.shelfCategory.itemList.length > 0
    }
  },
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
    ShelfFooter
  },
  methods: {
    onScroll (offsetY) {
      this.setOffsetY(offsetY)
    }
  },
  mounted () {
    this.getCategoryList(this.$route.query.title)
    this.setCurrentType(2)
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
    .store-shelf-empty-view {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      font-size: px2rem(14);
      color: #333;
      @include center;
    }
  }

</style>