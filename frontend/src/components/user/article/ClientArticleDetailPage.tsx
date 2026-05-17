import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Eye, User, ChevronRight, ShoppingBag, Home } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

import { getClientArticleBySlugApi } from '@/services/article/article.api'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export default function ClientArticleDetailPage() {
  const { t } = useTranslation('common')
  const { slug } = useParams<{ slug: string }>()

  // Dùng useQuery để fetch data dựa vào slug
  const {
    data: article,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['client-article', slug],
    queryFn: () => getClientArticleBySlugApi(slug as string),
    enabled: !!slug
  })

  // Skeleton Loading
  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-8 max-w-4xl animate-pulse space-y-6'>
        <div className='h-10 bg-muted rounded w-3/4'></div>
        <div className='flex gap-4'>
          <div className='h-4 bg-muted rounded w-24'></div>
          <div className='h-4 bg-muted rounded w-24'></div>
        </div>
        <div className='h-64 bg-muted rounded w-full'></div>
        <div className='space-y-3'>
          <div className='h-4 bg-muted rounded w-full'></div>
          <div className='h-4 bg-muted rounded w-full'></div>
          <div className='h-4 bg-muted rounded w-5/6'></div>
        </div>
      </div>
    )
  }

  // Not Found
  if (isError || !article) {
    return (
      <div className='container mx-auto px-4 py-20 text-center flex flex-col items-center gap-4'>
        <h1 className='text-3xl font-bold text-destructive'>Không tìm thấy bài viết</h1>
        <p className='text-muted-foreground'>Bài viết này không tồn tại hoặc đã bị xóa.</p>
        <Button asChild>
          <Link to='/'>Về trang chủ</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      {/* Breadcrumb đơn giản */}
      <nav className='flex items-center gap-2 text-sm text-muted-foreground mb-6'>
        <Link to='/' className='hover:text-primary flex items-center gap-1 transition-colors'>
          <Home className='h-4 w-4 mb-0.5' />
          {t('nav.home')}
        </Link>
        <ChevronRight className='h-4 w-4' />
        <Link to='/articles' className='hover:text-primary transition-colors'>
          {t('articlesList.title')}
        </Link>
        <ChevronRight className='h-4 w-4' />
        <span className='text-foreground font-medium truncate max-w-[200px] sm:max-w-none'>
          {article.title}
        </span>
      </nav>

      <article className='bg-card rounded-xl border p-5 sm:p-8 shadow-sm'>
        {/* HEADER: Tiêu đề & Thông tin Meta */}
        <header className='mb-8 space-y-4'>
          <h1 className='text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground leading-snug'>
            {article.title}
          </h1>

          <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground'>
            <div className='flex items-center gap-1.5'>
              <User className='h-4 w-4' />
              <span className='font-medium text-foreground'>{article.authorName}</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <Calendar className='h-4 w-4' />
              <time dateTime={article.createdAt}>
                {format(new Date(article.createdAt), 'dd MMMM, yyyy', { locale: vi })}
              </time>
            </div>
            <div className='flex items-center gap-1.5'>
              <Eye className='h-4 w-4' />
              <span>{article.viewCount.toLocaleString()} lượt xem</span>
            </div>
          </div>
        </header>

        {/* NỘI DUNG CHÍNH (Render HTML từ TipTap) */}
        <div className='prose prose-sm sm:prose-base max-w-none dark:prose-invert'>
          {/* Định dạng lại CSS cho các thẻ HTML được nhúng */}
          <style>{`
            .prose img { border-radius: 0.5rem; margin: 2rem auto; max-height: 500px; object-fit: cover; }
            .prose h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; }
            .prose h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; }
            .prose p { margin-bottom: 1.25rem; line-height: 1.75; }
            .prose a { color: hsl(var(--primary)); text-decoration: none; }
            .prose a:hover { text-decoration: underline; }
            .prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
            .prose blockquote { border-left: 4px solid hsl(var(--primary)); padding-left: 1rem; font-style: italic; color: hsl(var(--muted-foreground)); }
          `}</style>

          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        {/* SẢN PHẨM ĐÍNH KÈM */}
        {article.products && article.products.length > 0 && (
          <div className='mt-12 pt-8 border-t'>
            <h3 className='text-lg font-bold flex items-center gap-2 mb-4'>
              <ShoppingBag className='h-5 w-5 text-primary' />
              Sản phẩm được nhắc đến trong bài
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {article.products.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className='flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors group'
                >
                  <div className='h-12 w-12 rounded bg-background border flex items-center justify-center shrink-0 overflow-hidden'>
                    <ShoppingBag className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium text-sm truncate group-hover:text-primary transition-colors'>
                      {product.productName}
                    </p>
                    <p className='text-xs text-muted-foreground mt-0.5'>Xem chi tiết &rarr;</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
