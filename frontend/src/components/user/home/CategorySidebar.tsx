import {
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Watch,
  Cable,
  Home,
  Gamepad2,
  Camera,
  Tv,
  ChevronRight
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const categories = [
  { key: 'phones', icon: Smartphone },
  { key: 'laptops', icon: Laptop },
  { key: 'tablets', icon: Tablet },
  { key: 'audio', icon: Headphones },
  { key: 'smartwatch', icon: Watch },
  { key: 'accessories', icon: Cable },
  { key: 'smarthome', icon: Home },
  { key: 'gaming', icon: Gamepad2 },
  { key: 'cameras', icon: Camera },
  { key: 'tv', icon: Tv }
]

export function CategorySidebar() {
  const { t } = useTranslation('common')

  return (
    <aside className='bg-card rounded-lg border border-border overflow-hidden h-full'>
      <div className='px-4 py-2.5 border-b border-border bg-muted/40'>
        <h2 className='text-sm font-semibold text-foreground'>{t('categories.title')}</h2>
      </div>
      <ul className='py-1'>
        {categories.map(({ key, icon: Icon }) => (
          <li key={key}>
            <a
              href='#'
              className='group flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-colors'
            >
              <Icon className='h-4 w-4 text-muted-foreground group-hover:text-primary' />
              <span className='flex-1 truncate'>{t(`categories.${key}`)}</span>
              <ChevronRight className='h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity' />
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
