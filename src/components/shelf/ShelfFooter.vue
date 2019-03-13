<template>
  <div class="shelf-footer" v-show="isEditMode">
    <div class="shelf-footer-tab-wrapper" v-for="item in tabs" :key="item.index" @click="onTabClick(item)">
      <div class="shelf-footer-tab" :class="{'is-selected': isSelected}">
        <div class="icon-private tab-icon" v-if="item.index === 1 && !isPrivate"></div>
        <div class="icon-private-see tab-icon" v-if="item.index === 1 && isPrivate"></div>
        <div class="icon-download tab-icon" v-if="item.index === 2 && !isDownload"></div>
        <div class="icon-download-remove tab-icon" v-if="item.index === 2 && isDownload"></div>
        <div class="icon-move tab-icon" v-if="item.index === 3"></div>
        <div class="icon-shelf tab-icon" v-if="item.index === 4"></div>
        <div class="tab-text" :class="{'remove-text': item.index === 4}">{{label(item)}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { storeShelfMixin } from '@/utils/mixin'
import { saveBookShelf, removeLocalStorage } from '@/utils/localStorage'
import { download } from '@/api/store'
import { removeLocalForage } from '@/utils/localForage'

export default {
  mixins: [storeShelfMixin],
  data () {
    return {
      popupMenu: null
    }
  },
  methods: {
    removeBook (book) {
      // 删除某本书的缓存
      return new Promise((resolve, reject) => {
        removeLocalStorage(`${book.categoryText}/${book.fileName}-info`)
        removeLocalForage(`${book.fileName}`)
        resolve(book)
      })
    },
    removeSelectedBook (book) {
      // 删除选中书的缓存
      Promise.all(this.shelfSelected.map(book => this.removeBook(book)))
        .then(books => {
          // 返回的数组
          books.map(book => {
            book.cache = false
          })
          saveBookShelf(this.shelfList)
          this.simpleToast(this.$t('shelf.removeDownloadSuccess'))
        })
    },
    downloadBook (book) {
      // 下载某本书
      let text = ''
      const toast = this.toast({
        text
      })
      toast.continueShow()
      // 下载book
      return new Promise((resolve, reject) => {
        download(book, book => {
          // create-api 的 remove 方法, 下次调用时重新实例化
          toast.remove()
          resolve(book)
        }, reject, progressEvent => {
          // 下载进度
          const progress = Math.floor(progressEvent.loaded / progressEvent.total * 100) + '%'
          text = this.$t('shelf.progressDownload').replace('$1', `${book.fileName}.epub(${progress})`)
          toast.updateText(text)
        })
      })
    },
    async downloadSelectedBook () {
      // 下载所有选中的书
      for (let i = 0; i < this.shelfSelected.length; i++) {
        await this.downloadBook(this.shelfSelected[i]).then(book => {
          book.cache = true
        })
      }
    },
    onComplete () {
      // 每次popup操作完成后
      this.hidePopup()      
      this.setIsEditMode(false)
      // 将书架保存到localStorage
      saveBookShelf(this.shelfList)
    },
    label (item) {
      switch (item.index) {
        case 1:
          return this.isPrivate ? item.label2 : item.label
        case 2:
          return this.isDownload ? item.label2 : item.label
        default:
          return item.label
      }
    },
    hidePopup () {
      this.popupMenu.hide()
    },
    setPrivate () {
      let isPrivate
      if (this.isPrivate) {
        isPrivate = false
      } else {
        isPrivate = true
      }
      this.shelfSelected.forEach(book => {
        book.private = isPrivate
      })
      this.onComplete()
      if (isPrivate) {
        this.simpleToast(this.$t('shelf.setPrivateSuccess'))
      } else {
        this.simpleToast(this.$t('shelf.closePrivateSuccess'))
      }
    },
    showPrivate () {
      this.popupMenu = this.popup({
        title: this.isPrivate ? this.$t('shelf.closePrivateTitle') : this.$t('shelf.setPrivateTitle'),
        btn: [
          {
            text: this.isPrivate ? this.$t('shelf.close') : this.$t('shelf.open'),
            click: () => {
              // 设置私密阅读
              this.setPrivate()
            }
          }, {
            text: this.$t('shelf.cancel'),
            click: () => {
              this.hidePopup()
            }
          }
        ]
      }).show()
    },
    async setDownload () {
      this.onComplete()
      if (this.isDownload) {
        // 所有书都下载过, 即删除
        this.removeSelectedBook()
      } else {
        await this.downloadSelectedBook()
        saveBookShelf(this.shelfList)
        this.simpleToast(this.$t('shelf.setDownloadSuccess'))
      }
    },
    showDownload () {
      this.popupMenu = this.popup({
        title: this.isDownload ? this.$t('shelf.removeDownloadTitle') : this.$t('shelf.setDownloadTitle'),
        btn: [
          {
            text: this.isDownload ? this.$t('shelf.delete') : this.$t('shelf.open'),
            click: () => {
              // 设置私密阅读
              this.setDownload()
            }
          }, {
            text: this.$t('shelf.cancel'),
            click: () => {
              this.hidePopup()
            }
          }
        ]
      }).show()
    },
    removeSelected () {
      // 移出书架
      if (this.currentType === 2) {
        // 在分组中
        this.simpleToast(this.$t('shelf.operationNotPermitted'))
      } else {
        // 在一级书架中
        this.shelfSelected.forEach(selected => {
          this.setShelfList(this.shelfList.filter(book => book !== selected))
        })  
      }
      
      this.onComplete()
    },
    showRemove () {
      let title
      if (this.shelfSelected.length === 1) {
        title = this.$t('shelf.removeBookTitle').replace(/\$1/, `《${this.shelfSelected[0].title}》`)
      } else {
        title = this.$t('shelf.removeBookTitle').replace(/\$1/, this.$t('shelf.selectedBooks'))
      }
      this.popupMenu = this.popup({
        title,
        btn: [
          {
            text: this.$t('shelf.removeBook'),
            type: 'danger',
            click: () => {
              // 移出书架
              this.removeSelected()
            }
          }, {
            text: this.$t('shelf.cancel'),
            click: () => {
              this.hidePopup()
            }
          }
        ]
      }).show()
    },
    onTabClick (item) {
      if (!this.isSelected) {
        // 当前没有书被选中
        return
      }
      switch (item.index) {
        case 1:
          this.showPrivate()
          break
        case 2:
          this.showDownload()
          break
        case 3:
          this.dialog().show()
          break
        case 4:
          this.showRemove()
          break
        default:
          break
      }
    }
  },
  computed: {
    isSelected () {
      // 判断当前是否有图书选中
      return this.shelfSelected && this.shelfSelected.length > 0
    },
    tabs () {
      // 各个tab的内容
      return [
        {
          label: this.$t('shelf.private'),
          label2: this.$t('shelf.noPrivate'),
          index: 1
        },
        {
          label: this.$t('shelf.download'),
          label2: this.$t('shelf.delete'),
          index: 2
        },
        {
          label: this.$t('shelf.move'),
          index: 3
        },
        {
          label: this.$t('shelf.remove'),
          index: 4
        }
      ]
    },
    isPrivate () {
      // 当前选中图书是否是私密阅读状态
      if (!this.isSelected) {
        return false
      } else {
        return this.shelfSelected.every(item => item.private)
      }
    },
    isDownload () {
      if (!this.isSelected) {
        return false
      } else {
        return this.shelfSelected.every(item => item.cache)
      }
    }
  }
}
</script>

<style lang='scss' scoped>
  @import "../../assets/styles/global";
  .shelf-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 120;
    display: flex;
    width: 100%;
    height: px2rem(48);
    background: #fff;
    box-shadow: 0 px2rem(-2) px2rem(4) rgba(0, 0, 0, .1);
    .shelf-footer-tab-wrapper {
      flex: 1;
      width: 25%;
      height: 100%;
      .shelf-footer-tab {
        width: 100%;
        height: 100%;
        opacity: .5;
        @include columnCenter;
        .tab-icon {
          font-size: px2rem(20);
          color: #666;
          &.icon-shelf {
            color: $color-pink;
          }
        }
        .tab-text {
          margin-top: px2rem(5);
          font-size: px2rem(12);
          color: #666;
          &.remove-text {
            color: $color-pink;
          }
        }
        &.is-selected {
          opacity: 1;
        }
        
      }
    }
  }
</style>