import { ChevronRight, LayoutGrid } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFetchData } from '@/hooks/useFetchData'
import { getClientCategoriesApi } from '@/services/category/client-category.api'

export function CategorySidebar() {
  const { data: categories = [], isLoading } = useFetchData(
    'client-categories',
    getClientCategoriesApi
  )

  return (
    <aside className='bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden h-full flex flex-col'>
      <ul className='py-2 h-full max-h-[380px] overflow-y-auto scrollbar-thin [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200'>
        {isLoading ? (
          // Hiệu ứng Skeleton
          Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className='px-3 py-2.5'>
              <div className='flex items-center gap-3 animate-pulse'>
                <div className='h-5 w-5 bg-muted rounded-full shrink-0'></div>
                <div className='h-3 bg-muted rounded w-2/3'></div>
              </div>
            </li>
          ))
        ) : categories.length > 0 ? (
          // Render dữ liệu thật
          categories.map((cat) => (
            <li key={cat.id}>
              <Link
                to={`/products?categorySlug=${cat.slug}`}
                className='group flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors'
              >
                {cat.thumbnailUrl ? (
                  <img
                    src={cat.thumbnailUrl}
                    alt={cat.categoryName}
                    className='h-5 w-5 rounded-full object-contain opacity-80 group-hover:opacity-100 transition-opacity'
                  />
                ) : (
                  <LayoutGrid className='h-4 w-4 text-slate-400 group-hover:text-red-600' />
                )}
                <span className='flex-1 truncate'>{cat.categoryName}</span>
                <ChevronRight className='h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0' />
              </Link>
            </li>
          ))
        ) : (
          <li className='px-4 py-6 text-center text-sm text-muted-foreground italic'>
            Chưa có danh mục nào.
          </li>
        )}
      </ul>
    </aside>
  )
}
