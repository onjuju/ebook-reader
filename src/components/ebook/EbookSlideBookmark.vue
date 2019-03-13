<template>
  <div class="ebook-slide-bookmark">
    <div class="slide-bookmark-title">
      {{$t('book.bookmark')}} · {{bookmark ? bookmark.length : 0}}
    </div>
    <scroll class="slide-bookmark-list" :top="48" :bottom="48">
      <div class="slide-bookmark-item" v-for="(item, index) in bookmark" :key="index" @click="displayBookmark(item.cfi)">
        <div class="slide-bookmark-item-icon">
          <div class="icon-bookmark"></div>
        </div>
        <div class="slide-bookmark-item-text">
          {{item.text}}
        </div>
      </div>
    </scroll>
    
  </div>
</template>

<script>
import Scroll from '../common/Scroll'
import { getBookmark } from '@/utils/localStorage'
import { ebookMixin } from '@/utils/mixin'
export default {
  mixins: [ebookMixin],
  data () {
    return {
      bookmark: null
    }
  },
  watch: {
    settingVisible (v) {
      if (v === 3) {
        this.bookmark = getBookmark(this.fileName)
      }
    }
  },
  methods: {
    displayBookmark (target) {
      this.display(target, () => {
        this.hideTitleAndMenu()
      })
    }
  },
  mounted () {
    this.bookmark = getBookmark(this.fileName)
  },
  components: {
    Scroll
  }
}
</script>

<style lang='scss' scoped>
  @import '../../assets/styles/global';
  .ebook-slide-bookmark {
    width: 100%;
    .slide-bookmark-title {
      width: 100%;
      height: px2rem(48);
      font-size: px2rem(14);
      font-weight: bold;
      padding: 0 px2rem(15);
      box-sizing: border-box;
      @include left;
    }
    .slide-bookmark-list {
      box-sizing: border-box;
      padding: 0 px2rem(15);
      .slide-bookmark-item {
        display: flex;
        padding: px2rem(15) 0;
        box-sizing: border-box;
        .slide-bookmark-item-icon {
          flex: 0 0 px2rem(29);
          @include left;
          .icon-bookmark {
            width: px2rem(20);
            height: px2rem(20);
            font-size: px2rem(12);
            @include center;
            background: #bbb;
            border-radius: 50%;
          }
        }
        .slide-bookmark-item-text {
          font-size: px2rem(14);
          max-height: px2rem(45);
          @include ellipsis2(3);
        }
      }
    }
  }
</style>