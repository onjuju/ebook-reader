<template>
  <div>
    <transition name="slide-up">
      <div class="menu-wrapper" v-show="menuVisible" :class="{'hide-box-shadow': !menuVisible || settingVisible > -1}">
        <div class="icon-wrapper">
          <span class="icon-menu" @click="showSetting(3)"></span>
        </div>
        <div class="icon-wrapper">
          <span class="icon-progress" @click="showSetting(2)"></span>
        </div>
        <div class="icon-wrapper">
          <span class="icon-bright" @click="showSetting(1)"></span>
        </div>
        <div class="icon-wrapper">
          <span class="icon-A" @click="showSetting(0)"></span>
        </div>
      </div>
    </transition>
    <ebook-setting-font></ebook-setting-font>  
    <ebook-setting-font-popup></ebook-setting-font-popup>
    <ebook-setting-theme></ebook-setting-theme>
    <ebook-setting-progress></ebook-setting-progress>
    <ebook-slide></ebook-slide>
  </div>
  
</template>

<script>
import EbookSettingFont from './EbookSettingFont'
import EbookSettingFontPopup from './EbookSettingFontPopup'
import EbookSettingTheme from './EbookSettingTheme'
import EbookSettingProgress from './EbookSettingProgress'
import EbookSlide from './EbookSlide'
import { ebookMixin } from '../../utils/mixin'
export default {
  mixins: [ebookMixin],
  computed: {
    
  },
  components: {
    EbookSettingFont,
    EbookSettingFontPopup,
    EbookSettingTheme,
    EbookSettingProgress,
    EbookSlide
  },
  methods: {
    showSetting (key) {
      this.setSettingVisible(key)
    }
  }
}
</script>

<style lang='scss' scoped>
@import "../../assets/styles/global";
.menu-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: px2rem(48);
  background: #fff;
  z-index: 200;
  display: flex;
  box-shadow: 0 px2rem(-8) px2rem(8) rgba(0, 0, 0, .15);
  font-size: px2rem(20);
  .icon-wrapper {
    @include center;
    flex: 1;
    .icon-bright {
      font-size: px2rem(22);
    }
    .icon-progress {
      font-size: px2rem(24);
    } 
  }
  &.hide-box-shadow {
    box-shadow: none;
  }
}
</style>