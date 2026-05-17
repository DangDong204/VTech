import { Link } from 'react-router-dom'
import { Calendar, ImageIcon, ArrowRight, ChevronRight, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useFetchData } from '@/hooks/useFetchData'
import { getClientArticlesApi } from '@/services/article/article.api'

export default function ClientArticleListPage() {
  const { t, i18n } = useTranslation('common')
  const { data: articles = [], isLoading } = useFetchData('client-articles', getClientArticlesApi)

  const fmt = new Intl.DateTimeFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return (
    <div className='container mx-auto px-4 py-8 md:py-12 max-w-7xl'>
      {/* Breadcrumb */}
      <nav className='flex items-center gap-2 text-sm text-muted-foreground mb-8'>
        <Link to='/' className='hover:text-primary flex items-center gap-1 transition-colors'>
          <Home className='h-4 w-4 mb-0.5' />
          {t('nav.home', 'Trang chủ')}
        </Link>
        <ChevronRight className='h-4 w-4' />
        <span className='text-foreground font-medium'>
          {t('articlesList.breadcrumb', 'Tin tức công nghệ')}
        </span>
      </nav>

      <div className='mb-8 md:mb-10'>
        <h1 className='text-3xl md:text-4xl font-extrabold text-foreground mb-3'>
          {t('articlesList.title', 'Tin tức công nghệ')}
        </h1>
        <p className='text-muted-foreground max-w-2xl'>
          {t(
            'articlesList.subtitle',
            'Cập nhật những thông tin mới nhất về công nghệ, đánh giá sản phẩm và các mẹo hay dành cho bạn.'
          )}
        </p>
      </div>

      {isLoading ? (
        // Skeleton Loading
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className='bg-card h-72 rounded-lg border border-border animate-pulse'
            ></div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        // Empty State
        <div className='py-20 text-center flex flex-col items-center gap-4 bg-muted/30 rounded-xl border border-dashed'>
          <ImageIcon className='h-12 w-12 text-muted-foreground/50' />
          <h2 className='text-xl font-semibold'>
            {t('articlesList.empty.title', 'Chưa có bài viết nào')}
          </h2>
          <p className='text-muted-foreground'>
            {t(
              'articlesList.empty.desc',
              'Chúng tôi đang cập nhật thêm nội dung. Vui lòng quay lại sau!'
            )}
          </p>
        </div>
      ) : (
        // Lưới bài viết
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {articles.map((a, index) => {
            const fallbackHue = [250, 30, 150, 320][index % 4]

            return (
              <article
                key={a.id}
                className='group bg-card rounded-lg border border-border overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1'
              >
                <Link
                  to={`/articles/${a.slug}`}
                  className='relative aspect-[16/10] flex items-center justify-center overflow-hidden'
                >
                  {a.thumbnail ? (
                    <img
                      src={a.thumbnail}
                      alt={a.title}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
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

                <div className='p-4 sm:p-5 flex flex-col flex-1 gap-3'>
                  <div className='flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground tracking-wide uppercase'>
                    <Calendar className='h-3.5 w-3.5' />
                    <time dateTime={a.createdAt}>{fmt.format(new Date(a.createdAt))}</time>
                  </div>

                  <Link to={`/articles/${a.slug}`}>
                    <h3
                      className='text-base sm:text-lg font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors'
                      title={a.title}
                    >
                      {a.title}
                    </h3>
                  </Link>

                  <p
                    className='text-sm text-muted-foreground line-clamp-3 flex-1 leading-relaxed'
                    title={a.summary || ''}
                  >
                    {a.summary || t('articlesList.noSummary', 'Không có mô tả cho bài viết này.')}
                  </p>

                  <Button
                    asChild
                    variant='link'
                    className='self-start h-auto p-0 text-primary text-sm font-semibold gap-1.5 mt-2 hover:no-underline hover:text-[var(--primary-hover)]'
                  >
                    <Link to={`/articles/${a.slug}`}>
                      {t('news.readMore', 'Đọc tiếp')}{' '}
                      <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                    </Link>
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
