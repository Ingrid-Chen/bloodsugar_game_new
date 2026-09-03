import Taro from '@tarojs/taro'
import { CLOUD_ENV_ID } from '../config/cloud'
import { GAME_DATA_VERSION } from './game-data'

export type AnalyticsEventName =
  | 'app_open'
  | 'game_start'
  | 'game_resume'
  | 'intro_complete'
  | 'scene_view'
  | 'choice_submit'
  | 'game_exit'
  | 'game_restart'
  | 'game_complete'
  | 'game_over'

type AnalyticsValue = string | number | boolean
export type AnalyticsProperties = Record<string, AnalyticsValue | null | undefined>

const MAX_STRING_LENGTH = 100

let initialized = false
let cloudReady = false
const sessionId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

function getAppVersion(): string {
  try {
    const accountInfo = Taro.getAccountInfoSync()
    return accountInfo?.miniProgram?.version || 'development'
  } catch {
    return 'unknown'
  }
}

function cleanProperties(properties: AnalyticsProperties): Record<string, string | number> {
  const cleaned: Record<string, string | number> = {}
  Object.entries(properties).forEach(([key, value]) => {
    if (value == null) return
    if (typeof value === 'string') {
      cleaned[key] = value.slice(0, MAX_STRING_LENGTH)
      return
    }
    if (typeof value === 'number') {
      if (Number.isFinite(value)) cleaned[key] = value
      return
    }
    cleaned[key] = value ? 1 : 0
  })
  return cleaned
}

/** 初始化微信云开发。未填写环境 ID 时会安静降级，不影响游戏运行。 */
export function initializeAnalytics(): void {
  if (initialized) return
  initialized = true

  if (process.env.TARO_ENV !== 'weapp' || !CLOUD_ENV_ID.trim()) return

  try {
    Taro.cloud.init({ env: CLOUD_ENV_ID.trim() })
    cloudReady = true
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[analytics] 云开发初始化失败，详细统计暂未启用。', error)
    }
  }
}

/**
 * 同时上报到微信自定义分析和 CloudBase。
 * 统计失败绝不能打断玩家流程，因此调用方无需等待结果。
 */
export function trackEvent(
  eventName: AnalyticsEventName,
  properties: AnalyticsProperties = {}
): void {
  const cleaned = cleanProperties({ ...properties, game_data_version: GAME_DATA_VERSION })
  const appVersion = getAppVersion()

  if (process.env.TARO_ENV === 'weapp') {
    try {
      Taro.reportEvent(eventName, {
        ...cleaned,
        session_id: sessionId,
        app_version: appVersion,
      })
    } catch {
      // 微信后台尚未配置自定义事件时可能无法上报，不影响 CloudBase 与游戏本身。
    }
  }

  if (!cloudReady) return

  void Taro.cloud.callFunction({
    name: 'trackEvent',
    data: {
      eventName,
      sessionId,
      appVersion,
      properties: cleaned,
    },
  }).catch((error) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[analytics] ${eventName} 上报失败。`, error)
    }
  })
}
