<template>
  <el-container class="body">
    <el-header class="navi">
      <div class="title">获取Refresh Token</div>
      <el-menu
        style="justify-content: center;"
        :default-active="activeIndex"
        mode="horizontal"
        @select="handleSelect"
      >
        <el-menu-item index="manual">手动获取</el-menu-item>
        <el-menu-item index="auto">一键获取（推荐）</el-menu-item>
      </el-menu>
    </el-header>
    <el-main class="inner">
      <div v-show="activeIndex.includes('manual')">
        <div class="innerbox">
          <span>1.</span>打开
          <a href="javascript:" @click="onClickExternal()">这个链接<icon-external></icon-external></a>
        </div>
        <div class="innerbox">
          <span>2.</span>按F12打开控制台并切换到到网络（Network）选项卡
        </div>
        <div class="innerbox">
          <span>3.</span>在第三行的过滤器中输入 callback? 并勾选保留日志
        </div>
        <div class="innerbox">
          <span>4.</span>登录
        </div>
        <div class="innerbox">
          <span>5.</span>点开下面出现的callback开头的一行，右边切换到载荷选项卡，复制其中code：后面的字符，并填入下面的输入栏中
          <br/>注：此code有效期极短，请及时复制并生成Refresh Token
        </div>
        <div class="innerbox action">
          <el-input style="width:50%" v-model="code"></el-input>
          <el-button @click="generate()" :disabled="disbale">生成</el-button>
        </div>
        <el-image
          class="example"
          :src="img" 
          fit="contain" 
         />
      </div>
      <div v-show="activeIndex.includes('auto')">
        <el-button size="large" round @click="auto()">一键获取</el-button>
      </div>
    </el-main>
    <el-footer v-if="show_token">
        Refresh Token : {{ token }}
        <br/>
        此 Token 可长期使用，请妥善保存
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { Logger } from 'koishi'
import { send } from '@koishijs/client'
import { ref, computed } from 'vue'
import { IconExternal } from 'schemastery-vue/src/icons'

const logger = new Logger('front')
const url = ref<string>()
const code = ref<string>()
const token = ref<string>()
const img = 'https://raw.githubusercontent.com/SaarChaffee/koishi-plugin-pixiv-auth/master/docs/img/example.png'

function onClickExternal() {
  send('getLoginUrl').then(v => {
    url.value = v
    logger.info('url : '+url.value)
    open(url.value, '_blank')
  })
}

function generate() {
  send('getToken', code.value).then(v => {
    logger.info("Token : " + v)
    token.value = v
  })
}

function auto() {
  send('auto').then((v) => {
    logger.info('code : ' + v)
    code.value = v
    this.generate()
  })
}

const disbale = computed(() => {
  return code.value? false : true
})

const show_token = computed(() => {
  return token.value ? true : false
})

const activeIndex = ref('auto')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
  activeIndex.value = key
}
</script>

<style scoped>
.body {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  text-align: center;
}

.title {
  font-size: x-large;
}

.navi {
  padding: 40px;
  
}

.inner {
  padding: 60px;
}

.example {
  width: auto;
  height: 300px;
  position: fixed;
  top: 20%;
  right: 0%;
}

.innerbox {
  position: relative;
  display: block;
  outline: none;
  border: none;
  width: 100%;
  padding: 10px 0;
  margin-bottom: 30px;
  font-size: 16px;
  background-color: transparent;
  text-align: left;
}

.action {
  text-align: center;
}
</style>