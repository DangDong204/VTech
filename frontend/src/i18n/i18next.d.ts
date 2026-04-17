import 'i18next'
import enAuth from './locales/en/auth.json'
import enCommon from './locales/en/common.json'
import enProduct from './locales/en/product.json'
import enUser from './locales/en/user.json'
import enCategory from './locales/en/category.json'
import enBrand from './locales/en/brand.json'
import enTag from './locales/en/tag.json'
import enColor from './locales/en/color.json'
import enVersion from './locales/en/version.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      auth: typeof enAuth
      common: typeof enCommon
      product: typeof enProduct
      user: typeof enUser
      category: typeof enCategory
      brand: typeof enBrand
      tag: typeof enTag
      color: typeof enColor
      version: typeof enVersion
    }
  }
}
