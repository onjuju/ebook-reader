import { mapGetters, mapActions } from 'vuex'
import { themeList, addCss, getReadTimeByMinute } from '@/utils/book'
import { removeAllCss } from './book'
import { saveLocation, getBookmark, getBookShelf, saveBookShelf } from '@/utils/localStorage'
import { gotoBookDetail, appendAddToShelf, computeId, removeAddFromShelf } from './store'
import { shelf } from '@/api/store'

export const ebookMixin = {
  computed: {
    ...mapGetters([
      'fileName',
      'menuVisible',
      'settingVisible',
      'defaultFontSize',
      'defaultFontFamily',
      'fontFamilyVisible',
      'defaultTheme',
      'bookAvailable',
      'progress',
      'section',
      'isPaginating',
      'currentBook',
      'navigation',
      'cover',
      'metadata',
      'paginate',
      'pagelist',
      'offsetY',
      'isBookmark'
    ]),
    themeList () {
      return themeList(this)
    },
    getSectionName () {
      // if (this.section) {
      //   const sectionInfo = this.currentBook.section(this.section)
      //   // console.log(this.currentBook.navigation.get(setInterval.href)[0]['label']
      //   if (sectionInfo && sectionInfo.href && this.currentBook && this.currentBook.navigation) {
      //     return this.currentBook.navigation.get(sectionInfo.href)['label']
      //   }
      // }
      // return ''
      return this.section ? this.navigation[this.section].label : ''
    }
  },
  methods: {
    ...mapActions([
      'setFileName',
      'setMenuVisible',
      'setSettingVisible',
      'setDefaultFontSize',
      'setDefaultFontFamily',
      'setFontFamilyVisible',
      'setDefaultTheme',
      'setBookAvailable',
      'setProgress',
      'setSection',
      'setIsPaginating',
      'setCurrentBook',
      'setNavigation',
      'setCover',
      'setMetadata',
      'setPaginate',
      'setPagelist',
      'setOffsetY',
      'setIsBookmark'
    ]),
    initGlobalStyle () {
      removeAllCss()
      switch (this.defaultTheme) {
        case 'Default':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
          break
        case 'Eye':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_eye.css`)
          break
        case 'Gold':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_gold.css`)
          break
        case 'Night':
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_night.css`)
          break
        default:
          addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
      }
    },
    refreshLocation () {
      const currentLocation = this.currentBook.rendition.currentLocation()
      // epubcfi(/6/40[A335279_1_En_15_Chapter]!/4/12/8[Sec14]/18[Par50]/1:703)
      /**
       * cfi 就是定位到一个具体的字符位置
       */
      if (currentLocation && currentLocation.start) {
        const startCfi = currentLocation.start.cfi
        const progress = this.currentBook.locations.percentageFromCfi(startCfi)
        this.setSection(currentLocation.start.index)
        this.setProgress(Math.floor(progress * 100))
        saveLocation(this.fileName, startCfi)
        const bookmark = getBookmark(this.fileName)
        if (bookmark) {
          if (bookmark.some(item => item.cfi === startCfi)) {
            this.setIsBookmark(true)
          } else {
            this.setIsBookmark(false)
          }
        } else {
          this.setIsBookmark(false)
        }
      }
      if (this.pagelist && currentLocation.start) {
        const totalPage = this.pagelist.length
        const currentPage = currentLocation.start.location
        if (currentPage && currentPage > 0) {
          this.setPaginate(currentPage + ' / ' + totalPage)
        } else {
          this.setPaginate('')
        }
      } else {
        this.setPaginate('')
      }
    },
    hideTitleAndMenu () {
      this.setMenuVisible(false)
      this.setSettingVisible(-1)
      this.setFontFamilyVisible(false)
      // this.$store.dispatch('setMenuVisible', false)
    },
    display (target, cb) {
      if (target) {
        this.currentBook.rendition.display(target).then(() => {
          this.refreshLocation()
          if (cb) cb()
        })
      } else {
        return this.currentBook.rendition.display().then(() => {
          this.refreshLocation()
          if (cb) cb()
        })
      }
    },
    getReadTimeText () {
      // 设置时间
      return this.$t('book.haveRead').replace('$1', getReadTimeByMinute(this.fileName))
    }
  }
}

export const storeHomeMixin = {
  computed: {
    ...mapGetters([
      'offsetY', 
      'hotSearchOffsetY',
      'flapCardVisible'
    ])
  },
  methods: {
    ...mapActions([
      'setOffsetY', 
      'setHotSearchOffsetY',
      'setFlapCardVisible'
    ]),
    showBookDetail (book) {
      gotoBookDetail(this, book)
    }
  }
}

export const storeShelfMixin = {
  computed: {
    ...mapGetters(['isEditMode', 'shelfList', 'shelfSelected', 'shelfTitleVisible', 'offsetY', 'shelfCategory', 'currentType'])
  },
  methods: {
    ...mapActions(['setIsEditMode', 'setShelfList', 'setShelfSelected', 'setShelfTitleVisible', 'setOffsetY', 'setShelfCategory', 'setCurrentType']),
    showBookDetail (book) {
      gotoBookDetail(this, book)
    },
    getCategoryList (title) {
      this.getShelfList()
        .then(() => { // 获取书架数据后
          const categoryList = this.shelfList.filter(book => book.type === 2 && book.title === title)[0]
          this.setShelfCategory(categoryList)
        })
    },
    getShelfList () {
      let shelfList = getBookShelf()
      // localStorage 中是否有书架列表, 有的话就直接拿, 没有则请求
      if (!shelfList) {
        shelf().then(response => {
          if (response.status === 200 && response.data && response.data.bookList) {
            shelfList = appendAddToShelf(response.data.bookList)
            saveBookShelf(shelfList) // 保存到localStorage
            return this.setShelfList(shelfList) // 保存到Vuex
          } 
        })  
      } else {
        return this.setShelfList(shelfList)
      }
    },
    moveOutOfGroup (f) {
      // 将书籍移出分组并加入到书架中
      this.setShelfList(
        this.shelfList.map(book => {
          // 循环书架列表, 操作分组
          if (book.type === 2 && book.itemList) {
            book.itemList = book.itemList.filter(subBook => {
              // 保留没有被选中的图书
              return !subBook.selected
            }) 
          }
          return book
        })).then(() => {
          // 去掉书架列表中最后的添加符号
          // 将现在的书架列表与选中的图书进行合并, 并重新计算id
          const list = computeId(appendAddToShelf([].concat(removeAddFromShelf(this.shelfList), ...this.shelfSelected)))
          this.setShelfList(list)
            .then(() => {
              this.simpleToast(this.$t('shelf.moveBookOutSuccess'))
              // 回调
              f && f()
            })
        })
    }
  }
}