import type { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { initializeAnalytics, trackEvent } from './lib/analytics'
import './app.scss'

export default function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    initializeAnalytics()
    trackEvent('app_open')
  })

  return children
}
