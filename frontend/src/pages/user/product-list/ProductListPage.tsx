import { useFetchData } from '@/hooks/useFetchData'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ProductSkeleton } from '@/components/common/ProductSkeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductCard } from '@/components/user/home/ProductCard'
import { cn } from '@/lib/utils'
import { getAllBrandApi } from '@/services/brand/brand.api'
import { getClientCategoriesApi } from '@/services/category/client-category.api'
import {
  searchClientProductsApi,
  type SearchProductParams
} from '@/services/product/client-product.api'
import { getAllTagApi } from '@/services/tag/tag.api'
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Filter,
  Home,
  LayoutGrid,
  SlidersHorizontal,
  SortAsc,
  SortDesc,
  Tag,
  X,
  Zap
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const PRICE_RANGES = [
  { label: 'Dưới 2 triệu', min: 0, max: 2000000 },
  { label: 'Từ 2 - 4 triệu', min: 2000000, max: 4000000 },
  { label: 'Từ 4 - 7 triệu', min: 4000000, max: 7000000 },
  { label: 'Từ 7 - 13 triệu', min: 7000000, max: 13000000 },
  { label: 'Từ 13 - 20 triệu', min: 13000000, max: 20000000 },
  { label: 'Trên 20 triệu', min: 20000000, max: null }
]

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫'
}

export default function ProductListPage() {
  const { t } = useTranslation('common')
  const [searchParams, setSearchParams] = useSearchParams()

  // Lấy params từ URL
  const categorySlug = searchParams.get('categorySlug') || undefined
  const brandSlug = searchParams.get('brandSlug') || undefined
  const tagId = searchParams.get('tagId') || undefined

  // ĐÃ FIX LỖI "any" Ở ĐÂY: Ép kiểu chính xác vào thuộc tính sort của SearchProductParams
  const sort = (searchParams.get('sort') || 'newest') as SearchProductParams['sort']

  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined

  // State hiển thị cục bộ
  const [localMin, setLocalMin] = useState(minPrice ? String(minPrice) : '')
  const [localMax, setLocalMax] = useState(maxPrice ? String(maxPrice) : '')
  const [showAllBrands, setShowAllBrands] = useState(false)
  const [showAllCategories, setShowAllCategories] = useState(false)

  // Fetch Data Master
  const { data: categories = [] } = useFetchData('client-categories', getClientCategoriesApi)
  const { data: brands = [] } = useFetchData('brands', getAllBrandApi)
  const { data: tags = [] } = useFetchData('tags', getAllTagApi)

  // Fetch Sản phẩm tự động gọi lại mỗi khi có params trên URL thay đổi
  const { data: products = [], isLoading } = useFetchData(
    ['search-products', categorySlug, brandSlug, tagId, sort, minPrice, maxPrice],
    () => searchClientProductsApi({ categorySlug, brandSlug, tagId, sort, minPrice, maxPrice })
  )

  // Hàm cập nhật URL
  const updateFilter = (key: string, value: string | null) => {
    if (value) {
      searchParams.set(key, value)
    } else {
      searchParams.delete(key)
    }
    setSearchParams(searchParams)
  }

  const handleApplyPrice = () => {
    updateFilter('minPrice', localMin ? String(localMin) : null)
    updateFilter('maxPrice', localMax ? String(localMax) : null)
  }

  // --- LOGIC TẠO DANH SÁCH CÁC BỘ LỌC ĐANG CHỌN ---
  const activeFilters: { key: string; label: string }[] = []

  if (categorySlug) {
    const cat = categories.find((c) => c.slug === categorySlug)
    if (cat) activeFilters.push({ key: 'categorySlug', label: `Danh mục: ${cat.categoryName}` })
  }

  if (brandSlug) {
    const brand = brands.find((b) => b.slug === brandSlug)
    if (brand) activeFilters.push({ key: 'brandSlug', label: `Hãng: ${brand.brandName}` })
  }

  if (tagId) {
    const tag = tags.find((t) => t.id === tagId)
    if (tag) activeFilters.push({ key: 'tagId', label: `Nhu cầu: ${tag.tagName}` })
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const matchedRange = PRICE_RANGES.find(
      (r) => r.min === (minPrice || 0) && r.max === (maxPrice || null)
    )
    if (matchedRange) {
      activeFilters.push({ key: 'price', label: `Giá: ${matchedRange.label}` })
    } else {
      let priceLabel = 'Giá: '
      if (minPrice && maxPrice) priceLabel += `Từ ${formatVnd(minPrice)} - ${formatVnd(maxPrice)}`
      else if (minPrice) priceLabel += `Trên ${formatVnd(minPrice)}`
      else if (maxPrice) priceLabel += `Dưới ${formatVnd(maxPrice)}`
      activeFilters.push({ key: 'price', label: priceLabel })
    }
  }

  const removeActiveFilter = (key: string) => {
    if (key === 'price') {
      searchParams.delete('minPrice')
      searchParams.delete('maxPrice')
      setLocalMin('')
      setLocalMax('')
    } else {
      searchParams.delete(key)
    }
    setSearchParams(searchParams)
  }

  const clearAllFilters = () => {
    searchParams.delete('categorySlug')
    searchParams.delete('brandSlug')
    searchParams.delete('tagId')
    searchParams.delete('minPrice')
    searchParams.delete('maxPrice')
    setLocalMin('')
    setLocalMax('')
    setSearchParams(searchParams)
  }

  const displayBrands = showAllBrands ? brands : brands.slice(0, 8)
  const displayCategories = showAllCategories ? categories : categories.slice(0, 8)

  return (
    <div className='bg-slate-50 min-h-screen pb-12 pt-4'>
      <div className='container mx-auto px-4 max-w-7xl'>
        {/* BREADCRUMB */}
        <nav className='flex items-center text-sm text-muted-foreground mb-4'>
          <Link to='/' className='hover:text-primary flex items-center gap-1 transition-colors'>
            <Home className='h-4 w-4' />
            <span className='hidden sm:inline'>{t('nav.home', 'Trang chủ')}</span>
          </Link>
          <ChevronRight className='h-4 w-4 mx-1.5 shrink-0' />
          <span className='text-foreground font-medium'>Tìm kiếm sản phẩm</span>
        </nav>

        <div className='flex flex-col lg:flex-row gap-6 items-start'>
          {/* CỘT TRÁI: BỘ LỌC */}
          <div className='w-full lg:w-[280px] shrink-0 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2 pb-4 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 transition-colors'>
            {/* Lọc Hãng (Thương hiệu) */}
            <div className='bg-white rounded-xl border border-border/50 p-4 shadow-sm'>
              <h3 className='font-bold text-base mb-4 flex items-center gap-2'>
                <Filter className='h-4 w-4' /> Hãng sản xuất
              </h3>

              <div className='grid grid-cols-2 gap-2'>
                {displayBrands.map((brand) => {
                  const isSelected = brandSlug === brand.slug
                  return (
                    <button
                      key={brand.id}
                      onClick={() => updateFilter('brandSlug', isSelected ? null : brand.slug)}
                      className={cn(
                        'relative h-10 border rounded-lg flex items-center justify-center p-1 overflow-hidden transition-all bg-white hover:border-red-300',
                        isSelected ? 'border-red-500 ring-1 ring-red-500' : 'border-border'
                      )}
                    >
                      {brand.brandLogo ? (
                        <img
                          src={brand.brandLogo}
                          alt={brand.brandName}
                          className='max-h-full max-w-full object-contain'
                        />
                      ) : (
                        <span className='text-xs font-semibold text-slate-700'>
                          {brand.brandName}
                        </span>
                      )}

                      {/* Dấu tick FPT Style */}
                      {isSelected && (
                        <div className='absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-red-500 border-l-[16px] border-l-transparent'>
                          <svg
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='4'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='absolute -top-[15px] right-[1px] w-2 h-2 text-white'
                          >
                            <polyline points='20 6 9 17 4 12'></polyline>
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {brands.length > 8 && (
                <button
                  onClick={() => setShowAllBrands(!showAllBrands)}
                  className='w-full mt-3 flex items-center justify-center gap-1 text-blue-600 text-sm font-medium hover:underline py-1'
                >
                  {showAllBrands ? (
                    <>
                      Thu gọn <ChevronUp className='h-4 w-4' />
                    </>
                  ) : (
                    <>
                      Xem thêm {brands.length - 8} hãng <ChevronDown className='h-4 w-4' />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Lọc Nhu cầu (Tags) */}
            {tags.length > 0 && (
              <div className='bg-white rounded-xl border border-border/50 p-4 shadow-sm'>
                <h3 className='font-bold text-base mb-4 flex items-center gap-2'>
                  <Tag className='h-4 w-4' /> Nhu cầu
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {tags.map((tag) => {
                    const isSelected = tagId === tag.id
                    return (
                      <button
                        key={tag.id}
                        onClick={() => updateFilter('tagId', isSelected ? null : tag.id)}
                        className={cn(
                          'px-3 py-1.5 text-sm rounded-md border transition-all',
                          isSelected
                            ? 'bg-red-50 text-red-600 border-red-500 font-medium'
                            : 'bg-slate-50 text-slate-700 border-border hover:border-slate-400'
                        )}
                      >
                        {tag.tagName}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Lọc Danh mục */}
            <div className='bg-white rounded-xl border border-border/50 p-4 shadow-sm space-y-3'>
              <h3 className='font-bold text-base flex items-center gap-2'>
                <SlidersHorizontal className='h-4 w-4' /> Danh mục
              </h3>
              <div className='flex flex-col gap-2'>
                <button
                  onClick={() => updateFilter('categorySlug', null)}
                  className={`text-left text-sm py-1 hover:text-primary transition-colors ${!categorySlug ? 'text-primary font-bold' : 'text-muted-foreground'}`}
                >
                  Tất cả sản phẩm
                </button>
                {displayCategories.map((cat) => {
                  const isSelected = categorySlug === cat.slug
                  return (
                    <button
                      key={cat.id}
                      onClick={() => updateFilter('categorySlug', cat.slug)}
                      className={`flex items-center gap-2.5 text-left text-sm py-1 hover:text-primary transition-colors ${isSelected ? 'text-primary font-bold' : 'text-muted-foreground'}`}
                    >
                      {cat.thumbnailUrl ? (
                        <img
                          src={cat.thumbnailUrl}
                          alt={cat.categoryName}
                          className={`w-5 h-5 object-contain transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70'}`}
                        />
                      ) : (
                        <LayoutGrid className='w-4 h-4 opacity-50' />
                      )}
                      <span className='flex-1 truncate'>{cat.categoryName}</span>
                    </button>
                  )
                })}
              </div>

              {categories.length > 8 && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className='w-full mt-2 flex items-center justify-center gap-1 text-blue-600 text-sm font-medium hover:underline py-1'
                >
                  {showAllCategories ? (
                    <>
                      Thu gọn <ChevronUp className='h-4 w-4' />
                    </>
                  ) : (
                    <>
                      Xem thêm {categories.length - 8} danh mục <ChevronDown className='h-4 w-4' />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Lọc Giá */}
            <div className='bg-white rounded-xl border border-border/50 p-4 shadow-sm'>
              <h3 className='font-bold text-base mb-4'>Mức giá</h3>
              <div className='flex flex-wrap gap-2 mb-4'>
                {PRICE_RANGES.map((range, index) => {
                  const isSelected = minPrice === range.min && maxPrice === (range.max || undefined)
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (isSelected) {
                          updateFilter('minPrice', null)
                          updateFilter('maxPrice', null)
                          setLocalMin('')
                          setLocalMax('')
                        } else {
                          updateFilter('minPrice', range.min ? String(range.min) : null)
                          updateFilter('maxPrice', range.max ? String(range.max) : null)
                          setLocalMin(range.min ? String(range.min) : '')
                          setLocalMax(range.max ? String(range.max) : '')
                        }
                      }}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-md border transition-all',
                        isSelected
                          ? 'bg-red-50 text-red-600 border-red-500 font-medium'
                          : 'bg-slate-50 text-slate-700 border-border hover:border-slate-400'
                      )}
                    >
                      {range.label}
                    </button>
                  )
                })}
              </div>

              <div className='flex items-center gap-2 pt-3 border-t'>
                <Input
                  type='number'
                  placeholder='Từ'
                  className='h-8 text-sm'
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                />
                <span>-</span>
                <Input
                  type='number'
                  placeholder='Đến'
                  className='h-8 text-sm'
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                />
              </div>
              <Button className='w-full mt-3 h-8 text-sm' onClick={handleApplyPrice}>
                Áp dụng
              </Button>
            </div>
          </div>

          {/* CỘT PHẢI: DANH SÁCH & SẮP XẾP */}
          <div className='flex-1 flex flex-col gap-4'>
            {/* Topbar: Sắp xếp */}
            <div className='bg-white rounded-xl border border-border/50 p-3 shadow-sm flex flex-wrap items-center gap-2 lg:gap-4'>
              <span className='text-sm font-semibold text-slate-700 hidden sm:block ml-2'>
                Sắp xếp theo:
              </span>

              <button
                onClick={() => updateFilter('sort', 'newest')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  sort === 'newest'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                <Zap className='h-4 w-4' /> Mới nhất
              </button>

              <button
                onClick={() => updateFilter('sort', 'price-desc')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  sort === 'price-desc'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                <SortDesc className='h-4 w-4' /> Giá cao - thấp
              </button>

              <button
                onClick={() => updateFilter('sort', 'price-asc')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  sort === 'price-asc'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                <SortAsc className='h-4 w-4' /> Giá thấp - cao
              </button>

              <div className='ml-auto'>
                <span className='text-sm font-medium text-slate-500'>
                  Tìm thấy <strong className='text-primary'>{products.length}</strong> sản phẩm
                </span>
              </div>
            </div>

            {/* --- KHU VỰC HIỂN THỊ CÁC BỘ LỌC ĐANG CHỌN --- */}
            {activeFilters.length > 0 && (
              <div className='flex flex-wrap items-center gap-2 px-1 animate-in fade-in'>
                <span className='text-sm font-medium text-slate-600 mr-1'>Đang lọc theo:</span>
                {activeFilters.map((filter) => (
                  <div
                    key={filter.key}
                    className='flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-200 text-sm font-medium shadow-sm transition-all hover:bg-red-100'
                  >
                    {filter.label}
                    <button
                      onClick={() => removeActiveFilter(filter.key)}
                      className='hover:bg-red-200 rounded-full p-0.5 transition-colors focus:outline-none'
                    >
                      <X className='h-3.5 w-3.5' />
                    </button>
                  </div>
                ))}
                <button
                  onClick={clearAllFilters}
                  className='text-sm text-blue-600 hover:text-blue-800 hover:underline ml-2 font-medium transition-colors'
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Product Grid */}
            <div className='bg-white rounded-xl border border-border/50 p-4 sm:p-6 shadow-sm min-h-[500px]'>
              <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
                ) : products.length > 0 ? (
                  products.map((p) => <ProductCard key={p.id} product={p} />)
                ) : (
                  <div className='col-span-full py-20 flex flex-col items-center justify-center text-center'>
                    <img
                      src='/empty-search.png'
                      alt='Empty'
                      className='h-36 opacity-50 mb-4 grayscale'
                    />
                    <h3 className='text-lg font-bold text-slate-700'>
                      Không tìm thấy sản phẩm nào!
                    </h3>
                    <p className='text-sm text-slate-500 mt-2'>
                      Vui lòng thử bỏ bớt tiêu chí lọc để có thêm kết quả.
                    </p>
                    {activeFilters.length > 0 && (
                      <Button variant='outline' className='mt-4' onClick={clearAllFilters}>
                        Xóa bộ lọc
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
