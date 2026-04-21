import { ArrowRight, ImageIcon, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface Article {
  id: string
  titleKey: string
  excerptKey: string
  date: string
  hue: number
}

const articles: Article[] = [
  {
    id: 'a1',
    titleKey: 'news.a1.title',
    excerptKey: 'news.a1.excerpt',
    date: '2025-04-12',
    hue: 250
  },
  {
    id: 'a2',
    titleKey: 'news.a2.title',
    excerptKey: 'news.a2.excerpt',
    date: '2025-04-08',
    hue: 30
  },
  {
    id: 'a3',
    titleKey: 'news.a3.title',
    excerptKey: 'news.a3.excerpt',
    date: '2025-04-02',
    hue: 150
  },
  {
    id: 'a4',
    titleKey: 'news.a4.title',
    excerptKey: 'news.a4.excerpt',
    date: '2025-03-28',
    hue: 320
  }
]

export function TechNewsSection() {
  const { t, i18n } = useTranslation('common')
  const fmt = new Intl.DateTimeFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return (
    <section className='space-y-3 sm:space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg sm:text-xl font-bold text-foreground'>{t('news.title')}</h2>
        <a
          href='#'
          className='text-sm font-medium text-primary hover:text-[var(--primary-hover)] inline-flex items-center gap-1'
        >
          {t('home.viewAll')} <ArrowRight className='h-3.5 w-3.5' />
        </a>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
        {articles.map((a) => (
          <article
            key={a.id}
            className='group bg-card rounded-lg border border-border overflow-hidden flex flex-col transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5'
          >
            <div
              className='relative aspect-[16/10] flex items-center justify-center overflow-hidden'
              style={{
                background: `linear-gradient(135deg, oklch(0.9 0.08 ${a.hue}), oklch(0.78 0.12 ${a.hue}))`
              }}
            >
              <ImageIcon className='h-10 w-10 text-foreground/20 group-hover:scale-110 transition-transform duration-300' />
            </div>
            <div className='p-3 sm:p-4 flex flex-col flex-1 gap-2'>
              <div className='flex items-center gap-1.5 text-[11px] text-muted-foreground'>
                <Calendar className='h-3 w-3' />
                <time dateTime={a.date}>{fmt.format(new Date(a.date))}</time>
              </div>
              <h3 className='text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors'>
                {t(a.titleKey)}
              </h3>
              <p className='text-xs text-muted-foreground line-clamp-2 flex-1'>{t(a.excerptKey)}</p>
              <Button
                variant='link'
                size='sm'
                className='self-start h-auto p-0 text-primary text-xs gap-1'
              >
                {t('news.readMore')} <ArrowRight className='h-3 w-3' />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
