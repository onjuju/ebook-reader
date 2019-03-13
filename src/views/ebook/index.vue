<template>
  <div class="ebook" ref="ebook">
    <ebook-header></ebook-header>
    <ebook-title></ebook-title>
    <ebook-reader></ebook-reader>
    <ebook-menu></ebook-menu>
    <ebook-book-mark></ebook-book-mark>
    <ebook-footer></ebook-footer>
    <!-- http://192.168.0.102:8080/#/ebook/LifeSciences|2016_Book_TechnologicalAndInstitutionalI -->
  </div>
</template>

<script>
import EbookReader from '../../components/ebook/EbookReader.vue'
import EbookTitle from '../../components/ebook/EbookTitle.vue'
import EbookMenu from '../../components/ebook/EbookMenu.vue'
import EbookBookMark from '@/components/ebook/EbookBookMark.vue'
import EbookHeader from '@/components/ebook/EbookHeader'
import EbookFooter from '@/components/ebook/EbookFooter'
import { getReadTime, saveReadTime } from '@/utils/localStorage'
import { ebookMixin } from '@/utils/mixin'
  export default {
    components: {
      EbookReader,
      EbookTitle,
      EbookMenu,
      EbookBookMark,
      EbookHeader,
      EbookFooter
    },
    mixins: [ebookMixin],
    methods: {
      move (v) {
        if (v < 500) {
          this.$refs.ebook.style.top = v + 'px'
        }
      },
      startLoopReadTime () {
        let readTime = getReadTime(this.fileName)
        if (!readTime) {
          readTime = 0
        }
        this.task = setInterval(() => {
          readTime++
          if (readTime % 30 === 0) {
            saveReadTime(this.fileName, readTime)
          }
        }, 1000)
      },
      restore () {
        this.$refs.ebook.style.transition = 'all .2s linear'
        this.$refs.ebook.style.top = 0
        setTimeout(() => {
          this.$refs.ebook.style.transition = 'none'          
        }, 200)
      }
    },
    watch: {
      offsetY (v) {
        if (!this.menuVisible && this.bookAvailable) {
          if (v > 0) {
            this.move(v)
          } else if (v === 0) {
            this.restore()
          }
        }
      }
    },
    mounted () {
      this.startLoopReadTime()
    },
    beforeDestroy () {
      if (this.task) {
        clearInterval(this.task)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../assets/styles/global.scss";
  .ebook {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>