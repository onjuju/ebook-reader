<template>
  <transition name="fade">
    <div class="shelf-title" v-show="shelfTitleVisible" :class="{'hide-shadow': ifHideShadow}">
      <div class="shelf-title-text-wrapper">
        <span class="shelf-title-text">{{title}}</span>
        <span class="shelf-title-sub-text" v-show="isEditMode">{{selectedText}}</span>
      </div>
      <div class="shelf-title-btn-wrapper shelf-title-left" v-if="showClear">
        <span class="shelf-title-btn-text" @click="clearCache">{{$t('shelf.clearCache')}}</span>
      </div>
      <div class="shelf-title-btn-wrapper shelf-title-right" v-if="showEdit">
        <span class="shelf-title-btn-text" @click="onEditClick">{{isEditMode ? $t('shelf.cancel') : $t('shelf.edit')}}</span>
      </div>
      <div class="shelf-title-btn-wrapper shelf-title-left" v-if="showBack">
        <span class="icon-back" @click="back"></span>
      </div>
      <div class="shelf-title-btn-wrapper" :class="{'shelf-title-left': changeGroupLeft, 'shelf-title-right': changeGroupRight}" @click="changeGroup" v-if="showChangeGroup">
        <span class="shelf-title-btn-text">{{$t('shelf.editGroup')}}</span>
      </div>
    </div>
  </transition>
  
</template>

<script>
import { storeShelfMixin } from '@/utils/mixin'
import { clearLocalStorage, saveBookShelf } from '@/utils/localStorage'
import { clearLocalForage } from '@/utils/localForage'

export default {
  mixins: [storeShelfMixin],
  props: {
    title: {
      type: String
    }
  },
  computed: {
    // 分类是否为空
    emptyCategory () {
      return !this.shelfCategory || !this.shelfCategory.itemList || this.shelfCategory.itemList.length < 1
    },
    // 是否显示编辑按钮
    showEdit () {
      // 处于书架列表或者分类中且有图书
      return this.currentType === 1 || !this.emptyCategory
    },
    // 是否显示返回按钮
    showBack () {
      // 表示在分组内且不处于编辑模式
      return this.currentType === 2 && !this.isEditMode
    },
    // 是否显示改变分组
    showChangeGroup () {
      return this.currentType === 2 && (this.isEditMode || this.emptyCategory) // 在分组中且处于编辑模式或分组内没有图书
    },
    // 是否显示清除缓存
    showClear () {
      return this.currentType === 1
    },
    changeGroupLeft () {
      return !this.emptyCategory
    },
    changeGroupRight () {
      return this.emptyCategory
    },
    selectedText () {
      const selectedNumber = this.shelfSelected ? this.shelfSelected.length : 0
      return selectedNumber <= 0 ? this.$t('shelf.selectBook') : (selectedNumber === 1 ? this.$t('shelf.haveSelectedBook').replace('$1', selectedNumber) : this.$t('shelf.haveSelectedBooks').replace('$1', selectedNumber))
    },
    popupCancelBtn () {
      return this.createPopupBtn(this.$t('shelf.cancel'), () => {
        this.hidePopup()
      })
    }
  },
  methods: {
    onComplete () {
      this.hidePopup()
      // 将id不为当前分组id的项筛选出来赋值
      this.setShelfList(this.shelfList.filter(book => book.id !== this.shelfCategory.id))
        .then(() => {
          // 保存到localStorage
          saveBookShelf(this.shelfList)
          this.setIsEditMode(false)
          setTimeout(() => {
            this.$router.back()
          }, 1000)
        })
    },
    // 删除分组
    deleteGroup () {
      if (!this.emptyCategory) {
        // 当前不为空, 将当前分组中所有书选中
        this.setShelfSelected(this.shelfCategory.itemList)
        this.moveOutOfGroup(this.onComplete)
      } else {
        // 为空
        this.simpleToast(this.$t('shelf.removeGroupSuccess'))
        this.onComplete()
      }
    },
    changeGroupName () {
      this.hidePopup()
      this.dialog({
        showNewGroup: true,
        groupName: this.shelfCategory.title
      }).show()
    },
    hidePopup () {
      this.popupMenu.hide()
    },
    // 返回一个popup btn的对象
    createPopupBtn (text, onClick, type = 'normal') {
      return {
        text,
        type,
        click: onClick
      }
    },
    showDeleteGroup () {
      this.hidePopup()
      setTimeout(() => {
        this.popupMenu = this.popup({
          title: this.$t('shelf.deleteGroupTitle'),
          btn: [
            this.createPopupBtn(this.$t('shelf.confirm'), () => {
              this.deleteGroup()
            }, 'danger'),
            this.popupCancelBtn
          ]
        }).show()
      }, 200)
    },
    changeGroup () {
      this.popupMenu = this.popup({
        btn: [
          this.createPopupBtn(this.$t('shelf.editGroupName'), () => {
            this.changeGroupName()
          }),
          this.createPopupBtn(this.$t('shelf.deleteGroup'), () => {
            this.showDeleteGroup()
          }, 'danger'),
          this.popupCancelBtn
        ]
      }).show()
    },
    back () {
      this.$router.go(-1)
      this.setIsEditMode(false)
    },
    clearCache () {
      // 清除localStorage
      clearLocalStorage()
      // 清除indexDB
      clearLocalForage()
      // 清除书架
      this.setShelfList([])
      // 清除选中
      this.setShelfSelected([])
      // 重新获取书架数据
      this.getShelfList()
      this.simpleToast(this.$t('shelf.clearCacheSuccess'))
    },
    onEditClick () {
      this.setIsEditMode(!this.isEditMode) 
    }
  },
  watch: {
    offsetY (offsetY) {
      if (offsetY > 0) {
        this.ifHideShadow = false
      } else {
        this.ifHideShadow = true
      }
    },
    isEditMode (v) {
      // 编辑模式关闭时
      this.setShelfSelected([])
      this.shelfList.forEach(item => {
        item.selected = false
        if (item.itemList) {
          item.itemList.forEach(subItem => {
            subItem.selected = false
          })
        }
      })
    }
  },
  data () {
    return {
      ifHideShadow: true
    }
  }
}
</script>

<style lang='scss' scoped>
  @import '../../assets/styles/global';
  .shelf-title {
    position: relative;
    width: 100%;
    height: px2rem(42);
    background: #fff;
    z-index: 130;
    box-shadow: 0 px2rem(2) px2rem(2) 0 rgba(0, 0, 0, .1);
    &.hide-shadow {
      box-shadow: none;
    }
    .shelf-title-text-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: px2rem(42);
      @include columnCenter;
      .shelf-title-text {
        font-size: px2rem(16);
        line-height: px2rem(20);
        font-weight: bold;
        color: #333;
      }
      .shelf-title-sub-text {
        font-size: px2rem(12);
        color: #333;
      }
    }
    .shelf-title-btn-wrapper {
      position: absolute;
      top: 0;
      box-sizing: border-box;
      height: 100%;
      @include center;
      .shelf-title-btn-text {
        font-size: px2rem(14);
        color: #666;
      }
      .icon-back {
        font-size: px2rem(20);
        color: #666;
      }
      &.shelf-title-left {
        left: px2rem(14);
        // padding-left: px2rem(14);
      }
      &.shelf-title-right {
        right: 0;
        padding-right: px2rem(14);
      }
    }
  }
</style>