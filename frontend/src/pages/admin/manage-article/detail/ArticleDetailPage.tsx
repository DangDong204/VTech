import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, Eye, Tag, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getAdminArticleByIdApi } from '@/services/article/article.api'
import { ArticleStatusBadge } from '@/components/admin/data/manage-article/ArticleStatusBadge'
import { IMGAE_NOT_FOUND } from '@/defines/upload-image'

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('article')

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: () => getAdminArticleByIdApi(id!),
    enabled: !!id
  })

  if (isLoading) return <ArticleDetailSkeleton />

  if (!article) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 py-24'>
        <p className='text-muted-foreground'>{t('detail.notFound')}</p>
        <Button variant='outline' onClick={() => navigate('/dashboard/articles')}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          {t('detail.back')}
        </Button>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-4xl pb-16'>
      {/* Header bar */}
      <div className='mb-6 flex items-center justify-between rounded-md bg-secondary px-4 py-2'>
        <Button variant='ghost' size='sm' onClick={() => navigate('/dashboard/articles')}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          {t('detail.back')}
        </Button>
        <h1 className='font-semibold'>{t('detail.title')}</h1>
        <div className='w-24' /> {/* spacer */}
      </div>

      {/* Thumbnail */}
      <div className='mb-6 overflow-hidden rounded-xl border'>
        <img
          src={article.thumbnail ?? IMGAE_NOT_FOUND}
          alt={article.title}
          className='h-72 w-full object-cover'
        />
      </div>

      {/* Meta info */}
      <div className='mb-4 flex flex-wrap items-center gap-3'>
        <ArticleStatusBadge status={article.status} />

        <span className='flex items-center gap-1.5 text-sm text-muted-foreground'>
          <User className='h-3.5 w-3.5' />
          {article.authorName}
        </span>

        <span className='flex items-center gap-1.5 text-sm text-muted-foreground'>
          <Eye className='h-3.5 w-3.5' />
          {article.viewCount.toLocaleString()} {t('detail.views')}
        </span>

        <span className='flex items-center gap-1.5 text-sm text-muted-foreground'>
          <Calendar className='h-3.5 w-3.5' />
          {format(new Date(article.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
        </span>
      </div>

      {/* Title */}
      <h2 className='mb-2 text-3xl font-bold leading-tight'>{article.title}</h2>

      {/* Slug */}
      <p className='mb-4 font-mono text-xs text-muted-foreground'>/bai-viet/{article.slug}</p>

      {/* Summary */}
      {article.summary && (
        <div className='mb-6 rounded-lg border-l-4 border-primary bg-muted/40 px-4 py-3'>
          <p className='text-sm italic text-muted-foreground'>{article.summary}</p>
        </div>
      )}

      <Separator className='mb-6' />

      {/* Content - render HTML từ Tiptap */}
      <div
        className='article-content prose prose-sm dark:prose-invert max-w-none'
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Linked Products */}
      {article.products && article.products.length > 0 && (
        <>
          <Separator className='my-6' />
          <div>
            <p className='mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground'>
              <Tag className='h-4 w-4' />
              {t('detail.linkedProducts')}
            </p>
            <div className='flex flex-wrap gap-2'>
              {article.products.map((p) => (
                <Badge key={p.id} variant='secondary'>
                  {p.productName}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Footer timestamps */}
      <Separator className='my-6' />
      <div className='flex flex-wrap gap-6 text-xs text-muted-foreground'>
        <span>
          {t('detail.createdAt')}:{' '}
          {format(new Date(article.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
        </span>
        <span>
          {t('detail.updatedAt')}:{' '}
          {format(new Date(article.updatedAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
        </span>
      </div>

      {/* Prose styles cho content HTML */}
      <style>{`
        .article-content h1 { font-size: 1.875rem; font-weight: 700; margin: 1.25rem 0 0.625rem; }
        .article-content h2 { font-size: 1.5rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        .article-content h3 { font-size: 1.25rem; font-weight: 600; margin: 0.875rem 0 0.5rem; }
        .article-content p { margin: 0.625rem 0; line-height: 1.75; }
        .article-content ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .article-content ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .article-content li { margin: 0.25rem 0; }
        .article-content blockquote {
          border-left: 3px solid hsl(var(--border));
          padding-left: 1rem; margin: 0.75rem 0;
          color: hsl(var(--muted-foreground)); font-style: italic;
        }
        .article-content pre {
          background: hsl(var(--muted)); border-radius: 0.375rem;
          padding: 0.75rem 1rem; font-family: monospace;
          font-size: 0.875rem; overflow-x: auto; margin: 0.75rem 0;
        }
        .article-content code {
          background: hsl(var(--muted)); border-radius: 0.25rem;
          padding: 0.125rem 0.375rem; font-family: monospace; font-size: 0.875em;
        }
        .article-content pre code { background: none; padding: 0; }
        .article-content hr { border: none; border-top: 1px solid hsl(var(--border)); margin: 1.5rem 0; }
        .article-content img { max-width: 100%; height: auto; border-radius: 0.375rem; margin: 1rem auto; display: block; }
        .article-content a { color: hsl(var(--primary)); text-decoration: underline; }
        .article-content strong { font-weight: 600; }
      `}</style>
    </div>
  )
}

function ArticleDetailSkeleton() {
  return (
    <div className='mx-auto max-w-4xl pb-16'>
      <Skeleton className='mb-6 h-10 w-full rounded-md' />
      <Skeleton className='mb-6 h-72 w-full rounded-xl' />
      <div className='mb-4 flex gap-3'>
        <Skeleton className='h-5 w-20' />
        <Skeleton className='h-5 w-24' />
        <Skeleton className='h-5 w-20' />
      </div>
      <Skeleton className='mb-2 h-10 w-3/4' />
      <Skeleton className='mb-6 h-4 w-48' />
      <Skeleton className='mb-6 h-16 w-full' />
      <Skeleton className='h-px w-full' />
      <div className='mt-6 flex flex-col gap-3'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-5/6' />
        <Skeleton className='h-4 w-4/6' />
        <Skeleton className='h-4 w-full' />
      </div>
    </div>
  )
}
