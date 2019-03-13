<template>
  <div class="shelf-list" :style="{'top': shelfListTop}">
    <transition-group name="list" tag="div" id="shelf-list">
      <div v-for="item in data" :key="item.id" class="shelf-list-item-wrapper">
        <shelf-item :data="item" :style="{height: itemHeight}"></shelf-item>
        <div class="shelf-list-title-wrapper">
          <span class="shelf-list-title title-small">{{item.title}}</span>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { storeShelfMixin } from '@/utils/mixin'
import ShelfItem from './ShelfItem'
import { realPx, px2rem } from '@/utils/utils'

export default {
  mixins: [storeShelfMixin],
  props: {
    // 距离上方的top值 (决定于是否有输入框)
    top: {
      type: Number,
      default: 94
    },
    // 循环的数据
    data: Array
  },
  components: {
    ShelfItem
  },
  computed: {
    itemHeight () {
      // 高度 = w * 350 / 250
      return ((window.innerWidth - realPx(120)) / 3) / 250 * 350 + 'px'
    },
    shelfListTop () {
      // 求shelf-list组件的top值
      return px2rem(this.top) + 'rem'
    }
  },
  mounted () {
  }
}
</script>

<style lang='scss' scoped>
  @import "../../assets/styles/global";
  .shelf-list {
    position: absolute;
    z-index: 100;
    width: 100%;
    #shelf-list {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      padding: 0 px2rem(15);
      box-sizing: border-box;
      .shelf-list-item-wrapper {
        flex: 0 0 33.33%;
        width: 33.33%;
        padding: px2rem(15);
        box-sizing: border-box;
        &.list-leave-active {
          display: none;
        }
        &.list-move {
          transition: transform .5s;
        }
        .shelf-list-title-wrapper {
          margin-top: px2rem(10);
        }
      }  
    }
  }
</style>