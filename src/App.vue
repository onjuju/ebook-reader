<template>
  <div id="app">
    <span class="text">ABCDEFG</span>
    {{test}}
    <router-view/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
const getters = {
  a: () => 1,
  b: () => 2
}
function fn (keys) {
  const data = {}
  keys.forEach(key => {
    if (getters.hasOwnProperty(key)) {
      data[key] = getters[key]
    }
  })
  return data
}
export default {
  mounted () {
    // this.$store.dispatch('setTest', 30)
    //   .then(() => {
    //     console.log(this.test)
    //   })
    console.log(this.a,this.b,this.c)
  },
  computed: {
    ...mapGetters(['test']),
    ...fn(['a','b','c'])
  }
}
  document.addEventListener('DOMContentLoaded', () => {
    const html = document.querySelector('html')
    let fontSize = window.innerWidth / 10
    fontSize = fontSize > 50 ? 50 : fontSize
    html.style.fontSize = fontSize + 'px'
  })
</script>

<style lang="scss" scoped>
  @import "./assets/styles/global.scss";
  .text {
    font-family: 'Days One';
    font-size: px2rem(20);
    color: orange;
  }
</style>
