<template>
  <div class="body">
    <div class="container">
      <div class="inner">
        <h2>获取Refresh Token</h2>
        <div class="innerbox">
          <span>1.</span>打开
          <a href="javascript:" @click="onClickExternal(greeting)">这个链接<icon-external></icon-external></a>
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
        <div class="innerbox">
          <el-input v-model="code"></el-input>
          <el-button round @click="generate()" :disabled="disbale">生成</el-button>
        </div>
        <div class="innerbox" v-if="show_token">
          Refresh Token : {{ token }}
          <br/>
          此 Token 可长期使用，请妥善保存
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Logger } from 'koishi'
import { send } from '@koishijs/client'
import { ref, computed, onMounted } from 'vue'
import { IconExternal } from 'schemastery-vue/src/icons'

const logger = new Logger('front')
const greeting = ref<string>()
const code = ref<string>()
const token = ref<string>()

onMounted(() => {
  send('getLoginUrl').then(data => {
    logger.info(data)
    greeting.value = data
  })
})

function onClickExternal(value: string) {
  if (!value) return
  open(value, '_blank')
}

function generate() {
  send('getToken', code.value).then(data => {
    logger.info("data : " + data)
    token.value = data
  })
}

const disbale = computed(() => {
  return code.value? false : true
})

const show_token = computed(() => {
  return token.value ? true : false
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}

.body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.container {
  position: absolute;
}

.inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 400px;
  padding: 40px;
  /* background-color: rgba(0, 0, 0, 0.8); */
  /* box-shadow: 0 15px 25px rgba(0, 0, 0, 0.9); */
}

.inner .innerbox {
  position: relative;
  display: block;
  outline: none;
  border: none;
  width: 100%;
  padding: 10px 0;
  margin-bottom: 30px;
  font-size: 16px;
  background-color: transparent;
}

</style>