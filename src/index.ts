import { Context, Logger, Schema, Service, sleep } from 'koishi'
import { } from '@koishijs/plugin-console'
import { } from '@koishijs/assets'
import { } from 'koishi-plugin-puppeteer'
import { resolve } from 'path'
import util from 'util'
import crypto from 'crypto'
import qs from 'qs'
import { PixivAuthApi } from './types'
import puppeteer from 'puppeteer-core'
import chromeFinder from 'puppeteer-finder'
import url from 'url'

const logger = new Logger('pixiv-auth')

declare module 'koishi' {
  interface Context {
    pixivAuth: PixivAuth
  }
}

declare module '@koishijs/plugin-console' {
  interface Events {
    'getLoginUrl'(): string,
    'getToken'(code): Promise<string>,
    'auto'(): Promise<string>
  }
}

export const using = ['console', 'puppeteer'] as const
export interface Config { }
export const Config: Schema<Config> = Schema.object({})

class PixivAuth extends Service {
  private USER_AGENT = 'PixivAndroidApp/5.0.234 (Android 11; Pixel 5)'
  private REDIRECT_URI = "https://app-api.pixiv.net/web/v1/users/auth/pixiv/callback"
  private LOGIN_URL_PERFIX = "https://app-api.pixiv.net/web/v1/login"
  private AUTH_TOKEN_URL = "https://oauth.secure.pixiv.net/auth/token"
  private CLIENT_ID = 'MOBrBDS8blbauoSck0ZfDbtuzpyT'
  private CLIENT_SECRET = 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj'

  private config: Config
  private codeVerifier: string
  private codeChallenge: string
  private loginUrl: string

  constructor(ctx: Context, config: Config) {
    super(ctx, 'pixivAuth', true)
    this.config = config
  }

  getLoginUrl() {
    this.codeVerifier = crypto.randomBytes(64).toString('hex')
    this.codeChallenge = this.base64ToUrlEncode(crypto.createHash('sha256').update(this.codeVerifier).digest('base64'))

    const loginParams = {
      "code_challenge": this.codeChallenge,
      "code_challenge_method": "S256",
      "client": "pixiv-android",
    }
    this.loginUrl = `${this.LOGIN_URL_PERFIX}?${qs.stringify(loginParams)}`
    return this.loginUrl
  }

  async getToken(code): Promise<PixivAuthApi.PixivAuthResponse> {
    const resp = await this.ctx.http.post<PixivAuthApi.PixivAuthResponse>(this.AUTH_TOKEN_URL,
      {
        "client_id": this.CLIENT_ID,
        "client_secret": this.CLIENT_SECRET,
        "code": code,
        "code_verifier": this.codeVerifier,
        "grant_type": "authorization_code",
        "include_policy": "true",
        "redirect_uri": this.REDIRECT_URI,
      },
      {
        headers: {
          "User-Agent": this.USER_AGENT,
          "content-type": "application/x-www-form-urlencoded"
        }
      }).catch((err) => {
        logger.info("err : " + util.inspect(err.response, { showHidden: true, depth: null }))
        return null
      })

    return resp
  }

  base64ToUrlEncode(str: string) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  async auto() {
    let code = ''
    this.ctx.pixivAuth.getLoginUrl()
    const browser = await puppeteer.launch({ executablePath: chromeFinder(), headless: false })
    const page = await browser.newPage()
    await page.setDefaultTimeout(0)
    await page.goto(this.loginUrl)
    await page.waitForResponse(async r => {
      if (r.url().startsWith('https://app-api.pixiv.net/web/v1/users/auth/pixiv/callback?')) {
        code = new URLSearchParams(r.url()).get('code')
        return true
      }
    })
    await page.close()
    await browser.close()
    return code
  }
}

export function apply(ctx: Context) {
  ctx.plugin(PixivAuth)

  ctx.console.addListener('getLoginUrl', () => {
    return ctx.pixivAuth.getLoginUrl()
  })

  ctx.console.addListener('getToken', async (code) => {
    const resp = await ctx.pixivAuth.getToken(code)
    return resp.refresh_token
  })

  ctx.console.addListener('auto', async () => {
    return await ctx.pixivAuth.auto()
  })

  ctx.using(['console'], (ctx) => {
    ctx.console.addEntry({
      dev: resolve(__dirname, '../client/index.ts'),
      prod: resolve(__dirname, '../dist'),
    })
  })
}
