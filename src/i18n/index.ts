import { createI18n as createBaseI18n, type I18n, type ResourceBundle } from '../components/i18n'
import zhCNApp from './zh-CN'
import enUSApp from './en-US'

export type { I18n }

const appResources: ResourceBundle = {
  'zh-CN': zhCNApp,
  'en-US': enUSApp
}

export function createAppI18n(locale?: string): I18n {
  return createBaseI18n(locale, appResources)
}
