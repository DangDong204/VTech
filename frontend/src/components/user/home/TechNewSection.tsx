import { ArrowRight, ImageIcon, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useFetchData } from '@/hooks/useFetchData'
import { getClientArticlesApi } from '@/services/article/article.api'

export function TechNewsSection() {
  const { t, i18n } = useTranslation('common') // Giả sử bạn đang dùng namespace 'common' cho trang chủ

  // 1. Lấy dữ liệu thật từ Backend
  const { data: articles = [], isLoading } = useFetchData('client-articles', getClientArticlesApi)

  const fmt = new Intl.DateTimeFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  // Chỉ lấy 4 bài viết mới nhất để hiển thị trên trang chủ
  const displayArticles = articles.slice(0, 4)

  if (isLoading) {
    return (
      <section className='space-y-4 animate-pulse'>
        <div className='h-8 w-48 bg-muted rounded'></div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='bg-card h-64 rounded-lg border border-border'></div>
          ))}
        </div>
      </section>
    )
  }

  // Ẩn section nếu không có bài viết nào
  if (displayArticles.length === 0) return null

  return (
    <section className='space-y-3 sm:space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg sm:text-xl font-bold text-foreground'>
          {t('news.title', 'Tin tức công nghệ')}
        </h2>
        <Link
          to='/articles' // Đường dẫn tới trang danh sách tất cả bài viết (Bạn có thể đổi route này)
          className='text-sm font-medium text-primary hover:text-[var(--primary-hover)] inline-flex items-center gap-1'
        >
          {t('home.viewAll', 'Xem tất cả')} <ArrowRight className='h-3.5 w-3.5' />
        </Link>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
        {displayArticles.map((a, index) => {
          // Tạo một mã màu ngẫu nhiên dựa trên index để làm fallback background nếu không có thumbnail
          const fallbackHue = [250, 30, 150, 320][index % 4]

          return (
            <article
              key={a.id}
              className='group bg-card rounded-lg border border-border overflow-hidden flex flex-col transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5'
            >
              <Link
                to={`/articles/${a.slug}`}
                className='relative aspect-[16/10] flex items-center justify-center overflow-hidden'
              >
                {a.thumbnail ? (
                  <img
                    src={a.thumbnail}
                    alt={a.title}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                  />
                ) : (
                  <div
                    className='absolute inset-0 flex items-center justify-center'
                    style={{
                      background: `linear-gradient(135deg, oklch(0.9 0.08 ${fallbackHue}), oklch(0.78 0.12 ${fallbackHue}))`
                    }}
                  >
                    <ImageIcon className='h-10 w-10 text-foreground/20 group-hover:scale-110 transition-transform duration-300' />
                  </div>
                )}
              </Link>

              <div className='p-3 sm:p-4 flex flex-col flex-1 gap-2'>
                <div className='flex items-center gap-1.5 text-[11px] text-muted-foreground'>
                  <Calendar className='h-3 w-3' />
                  <time dateTime={a.createdAt}>{fmt.format(new Date(a.createdAt))}</time>
                </div>

                <Link to={`/articles/${a.slug}`}>
                  <h3
                    className='text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors'
                    title={a.title}
                  >
                    {a.title}
                  </h3>
                </Link>

                <p
                  className='text-xs text-muted-foreground line-clamp-2 flex-1'
                  title={a.summary || ''}
                >
                  {a.summary || 'Không có mô tả cho bài viết này.'}
                </p>

                <Button
                  asChild
                  variant='link'
                  size='sm'
                  className='self-start h-auto p-0 text-primary text-xs gap-1'
                >
                  <Link to={`/articles/${a.slug}`}>
                    {t('news.readMore', 'Đọc tiếp')} <ArrowRight className='h-3 w-3' />
                  </Link>
                </Button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
