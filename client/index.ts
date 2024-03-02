import { Context } from '@koishijs/client'
import Page from './page.vue'
import 'uno.css'

export default (ctx: Context) => {
  ctx.page({
    name: '获取 Refresh Token',
    path: '/pixiv_auth',
    component: Page,
  })
}
