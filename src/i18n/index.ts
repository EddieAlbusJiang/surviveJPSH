import { createI18n as createBaseI18n, type I18n, type ResourceBundle } from '../components/i18n'
import zhCNApp from './zh-CN'

export type { I18n }

const appResources: ResourceBundle = {
  'zh-CN': zhCNApp,
  'en-US': {}
}

export function createAppI18n(_locale?: string): I18n {
  return createBaseI18n('zh-CN', appResources)
}
