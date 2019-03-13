<template>
  <div class="ebook-reader">
    <div id="read"></div>
    <div class="ebook-reader-mask"
         @click="onMaskClick"
         @touchmove="move"
         @touchend="moveEnd"
         @mousedown.left="onMouseEnter"
         @mousemove="onMouseMove"
         @mouseup="onMouseEnd">
    </div>
  </div>
</template>

<script>
import Epub from 'epubjs'
import { ebookMixin } from '@/utils/mixin'
import { flatten } from '@/utils/book'
import { getFontFamily, saveFontFamily, getFontSize, saveFontSize, getTheme, saveTheme, getLocation } from '@/utils/localStorage'
import { getLocalForage } from '@/utils/localForage'

global.ePub = Epub
export default {
  mixins: [ebookMixin],
  computed: {
    
  },
  methods: {
    /**
     * 鼠标状态
     * 1 - 鼠标进入
     * 2 - 鼠标进入后移动
     * 3 - 鼠标从移动状态松手
     * 4 - 鼠标还原
     */
    onMouseEnter (e) {
      this.mouseState = 1
      this.mouseStartTime = e.timeStamp
      e.preventDefault()
      e.stopPropagation()
    },
    onMouseMove (e) {
      if (this.mouseState === 1) {
        this.mouseState = 2
      } else if (this.mouseState === 2) {
        let offsetY = 0
        if (this.firstOffsetY) {
          offsetY = e.clientY - this.firstOffsetY
          this.setOffsetY(offsetY)
        } else {
          this.firstOffsetY = e.clientY
        }
      }
      e.preventDefault()
      e.stopPropagation()
    },
    onMouseEnd (e) {
      if (this.mouseState === 2) {
        this.setOffsetY(0)
        this.firstOffsetY = null
        this.mouseState = 3
      } else {
        this.mouseState = 4
      }
      const time = e.timeStamp - this.mouseStartTime
      if (time < 100) {
        this.mouseState = 4
      }
      e.preventDefault()
      e.stopPropagation()
    },
    move (e) {
      let offsetY = 0
      if (this.firstOffsetY) {
        offsetY = e.changedTouches[0].clientY - this.firstOffsetY
        this.setOffsetY(offsetY)
      } else {
        this.firstOffsetY = e.changedTouches[0].clientY
      }
      e.preventDefault()
      e.stopPropagation()
    },
    moveEnd (e) {
      this.setOffsetY(0)
      this.firstOffsetY = null
    },
    onMaskClick (e) {
      if (this.mouseState && (this.mouseState === 2 || this.mouseState === 3)) {
        return // 拖动
      } 
      const offsetX = e.offsetX
      const width = window.innerWidth
      if (offsetX > 0 && offsetX < width * 0.3) {
        this.prevPage()
      } else if (offsetX > 0 && offsetX > width * 0.7) {
        this.nextPage()
      } else {
        this.toggleTitleAndMenu()
      }
    },
    prevPage () {
      if (this.rendition) {
        this.rendition.prev().then(() => {
          this.refreshLocation()
        })
        this.menuVisible && this.hideTitleAndMenu()
      }
    },
    nextPage () {
      if (this.rendition) {
        this.rendition.next().then(() => {
          this.refreshLocation()          
        })
        this.menuVisible && this.hideTitleAndMenu()
      }
    },
    toggleTitleAndMenu () {
      if (this.menuVisible) {
        this.setSettingVisible(-1)
        this.setFontFamilyVisible(false)
      }
      this.setMenuVisible(!this.menuVisible)
      // this.$store.dispatch('setMenuVisible', !this.menuVisible)
    },
    initFontSize () {
      let fontSize = getFontSize(this.fileName)
      if (!fontSize) {
        saveFontSize(this.fileName, this.defaultFontSize)
      } else {
        this.setDefaultFontSize(fontSize)
        this.rendition.themes.fontSize(fontSize)
      }
    },
    initFontFamily () {
      let font = getFontFamily(this.fileName)
      if (!font) {
        saveFontFamily(this.fileName, this.defaultFontFamily)
      } else {
        this.setDefaultFontFamily(font)
        this.rendition.themes.font(font)
      }
    },
    initTheme () {
      let defaultTheme = getTheme(this.fileName)
      if (!defaultTheme) {
        defaultTheme = this.themeList[0].name
        saveTheme(this.fileName, defaultTheme)
      }
      this.setDefaultTheme(defaultTheme)
      this.themeList.forEach(item => {
        this.rendition.themes.register(item.name, item.style)
      })
      this.rendition.themes.select(this.defaultTheme)
    },
    initRendition () {
      this.rendition = this.book.renderTo('read', {
        width: innerWidth,
        hieght: innerHeight,
        method: 'default'
        // flow: 'scrolled'
      })
      const location = getLocation(this.fileName)
      this.display(location, () => {
        this.initTheme()
        this.initFontSize()
        this.initFontFamily()
        this.initGlobalStyle()
      })
      this.rendition.hooks.content.register(contents => {
        Promise.all([
          contents.addStylesheet(process.env.VUE_APP_RES_URL + '/fonts/daysOne.css'),
          contents.addStylesheet(process.env.VUE_APP_RES_URL + '/fonts/cabin.css'),
          contents.addStylesheet(process.env.VUE_APP_RES_URL + '/fonts/montserrat.css'),
          contents.addStylesheet(process.env.VUE_APP_RES_URL + '/fonts/tangerine.css')    
        ]).then(() => {
        })
      })
    },
    initGesture () {
      this.rendition.on('touchstart', event => {
        this.touchStartX = event.changedTouches[0].clientX
        this.touchStartTime = event.timeStamp
      })
      this.rendition.on('touchend', event => {
        const offsetX = event.changedTouches[0].clientX - this.touchStartX
        const time = event.timeStamp - this.touchStartTime
        if (time < 500 && offsetX > 40) {
          this.prevPage()
        } else if (time < 500 && offsetX < -40) {
          this.nextPage()
        } else {
          this.toggleTitleAndMenu()
        }
        event.preventDefault()
        event.stopPropagation()
      })
    },
    parseBook () {
      this.book.loaded.cover.then(cover => {
        this.book.archive.createUrl(cover).then(url => {
          this.setCover(url)
        })
      })
      this.book.loaded.metadata.then(metadata => {
        this.setMetadata(metadata)
      })
      this.book.loaded.navigation.then(nav => {
        const navItems = flatten(nav.toc)
        function find (item, level = 0) {
          if (item.parent == null) {
            return level
          } else {
            return find(navItems.filter(parentItem => parentItem.id === item.parent)[0], ++level)
          }
        }
        navItems.forEach(item => {
          item.level = find(item)
        })
        this.setNavigation(navItems)
      })
    },
    initEpub (url) {
      // Epub 函数可以解析blob对象或者url路径
      this.book = new Epub(url)
      this.setCurrentBook(this.book)
      this.initRendition()
      // this.initGesture()
      this.parseBook()
      this.book.ready.then(() => {
        // 解析后调用
        // 计算字数
        return this.book.locations.generate(750 * (window.innerWidth / 375) * (getFontSize(this.fileName) / 16))
      }).then(locations => {
        this.navigation.forEach(nav => {
          nav.pagelist = []
        })
        locations.forEach(item => {
          const loc = item.match(/\[(.*)\]!/)[1]
          this.navigation.forEach(nav => {
            if (nav.href) {
              const href = nav.href.match(/^(.*)\.x?html$/)[1]
              if (href === loc) {
                nav.pagelist.push(item)
              }
            }
          })
          let currentPage = 1
          this.navigation.forEach((nav, index) => {
            if (index === 0) {
              nav.page = 1
            } else {
              nav.page = currentPage
            }
            currentPage += nav.pagelist.length + 1
          })
        })
        this.setPagelist(locations)
        this.setBookAvailable(true)
        this.refreshLocation()
      })
    }
  },
  mounted () {
    const books = this.$route.params.fileName.split('|')
    const fileName = books[1]
    getLocalForage(fileName, (err, blob) => {
      if (!err && blob) {
        // 找到缓存电子书
        this.setFileName(books.join('/'))
          .then(() => {
            this.initEpub(blob)
          })
      } else {
        // 需要在线获取电子书
        this.setFileName(books.join('/'))
          .then(() => {
            const url = `${process.env.VUE_APP_EPUB_URL}/${this.fileName}.epub`
            this.initEpub(url)
          })
      }
    })
  }
}
</script>

<style lang='scss' scoped>
  .ebook-reader {
    widows: 100%;
    height: 100%;
    overflow: hidden;
    .ebook-reader-mask {
      position: absolute;
      top: 0;
      left: 0;
      background: transparent;
      width: 100%;
      height: 100%;
    }
  }
</style>