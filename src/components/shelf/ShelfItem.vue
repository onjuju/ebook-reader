<template>
  <div class="shelf-item" :class="{'shelf-item-shadow': data.type !== 3}" @click="onItemClick">
    <component :is="item" :data="data" class="shelf-item-comp" :class="{'is-edit': data.type === 2 && isEditMode}" />
    <div class="icon-selected" :class="{'is-selected': data.selected}" v-show="isEditMode && data.type === 1"></div>
  </div>
</template>

<script>
import { storeShelfMixin } from '@/utils/mixin'
import ShelfBook from './ShelfItemBook'
import ShelfCategory from './ShelfItemCategory'
import ShelfAdd from './ShelfItemAdd'
import { gotoStoreHome } from '@/utils/store'

export default {
  mixins: [storeShelfMixin],
  props: {
    data: Object
  },
  data () {
    return {
      book: ShelfBook, // 每个书/分组的详细信息
      category: ShelfCategory,
      add: ShelfAdd
    }
  },
  computed: {
   item () {
     return [0, this.book, this.category, this.add][this.data.type]
   } 
  },
  methods: {
    onItemClick () {
      if (this.isEditMode) {
        this.data.selected = !this.data.selected
        if (this.data.selected && this.data.type === 1) {
          // 选中图书
          this.shelfSelected.pushWithoutDuplicate(this.data)
        } else {
          // 
          this.setShelfSelected(this.shelfSelected.filter(item => item.id !== this.data.id))
        }
      } else {
        if (this.data.type === 1) {
          this.showBookDetail(this.data)
        } else if (this.data.type === 2) {
          this.$router.push({
            path: '/store/category',
            query: {
              title: this.data.title
            }
          })
        } else {
          gotoStoreHome(this)
        }  
      }
    }
  }
}
</script>

<style lang='scss' scoped>
  @import "../../assets/styles/global";
  .shelf-item {
    width: 100%;
    height: 100%;
    position: relative;
    .shelf-item-comp {
      opacity: 1;
      &.is-edit {
        opacity: .5;
      }
    }
    &.shelf-item-shadow {
      box-shadow: px2rem(2) px2rem(2) px2rem(2) rgba(100, 100, 100, .1), px2rem(-1) px2rem(0) px2rem(1) rgba(100, 100, 100, .1);
    }
    .icon-selected {
      position: absolute;
      bottom: px2rem(2);
      right: px2rem(2);
      font-size: px2rem(18);
      color: rgba(0, 0, 0, .4);
      &.is-selected {
        color: $color-blue;
      }
    }
  }
</style>