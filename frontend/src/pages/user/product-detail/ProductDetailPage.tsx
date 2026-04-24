import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronRight,
  Home,
  Loader2,
  Star,
  Gift,
  ShieldCheck,
  Truck,
  Check,
  Headset
} from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/contexts/CartContext'
import { ImageGallery } from '@/components/user/product-detail/ImageGallery'
import { VersionSelector } from '@/components/user/product-detail/VersionSelector'
import { ColorSelector } from '@/components/user/product-detail/ColorSelector'
import { ProductDescription } from '@/components/user/product-detail/ProductDesc'
import { ProductReviews } from '@/components/user/product-detail/ProductReview'
import { SpecsTable } from '@/components/user/product-detail/SpecsTable'
import { useTranslation } from 'react-i18next'
import { getClientProductDetailApi } from '@/services/product/client-product.api'
import type { ClientProductDetailResponse } from '@/services/product/client-product.type'

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫'
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { t } = useTranslation('common')

  // ---------- State ----------
  const [product, setProduct] = useState<ClientProductDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedVersion, setSelectedVersion] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')

  // ---------- Fetch ----------
  useEffect(() => {
    if (!slug) return

    let isMounted = true

    const fetchProduct = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getClientProductDetailApi(slug)

        if (isMounted) {
          setProduct(data)
          if (data.versions?.length) setSelectedVersion(data.versions[0])
          if (data.colors?.length) setSelectedColor(data.colors[0].name)
        }
      } catch {
        if (isMounted) {
          setError('Không tìm thấy sản phẩm hoặc đã xảy ra lỗi.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchProduct()

    return () => {
      isMounted = false
    }
  }, [slug])

  // ---------- Tính giá theo biến thể đang chọn ----------
  const currentVariant = useMemo(() => {
    if (!product?.variantList?.length) return null
    return (
      product.variantList.find((v) => v.version === selectedVersion && v.color === selectedColor) ||
      product.variantList.find((v) => v.version === selectedVersion) ||
      product.variantList[0]
    )
  }, [product, selectedVersion, selectedColor])

  // ---------- Handlers ----------
  const handleAddToCart = (quantity: number) => {
    if (!product || !currentVariant) return
    addItem(
      {
        id: currentVariant.id,
        name: `${product.name} ${currentVariant.version}`,
        price: currentVariant.price,
        originalPrice: currentVariant.originalPrice,
        image: product.images[0],
        variant: { color: currentVariant.color, storage: currentVariant.version }
      },
      quantity
    )
    toast.success('Đã thêm sản phẩm vào giỏ hàng!')
  }

  const handleBuyNow = (quantity: number) => {
    handleAddToCart(quantity)
    navigate('/cart')
  }

  // ---------- Render states ----------
  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] gap-4'>
        <p className='text-muted-foreground text-lg'>{error ?? 'Sản phẩm không tồn tại.'}</p>
        <Link to='/' className='text-primary underline'>
          Quay về trang chủ
        </Link>
      </div>
    )
  }

  const displayPrice = currentVariant?.price ?? product.price
  const displayOriginalPrice = currentVariant?.originalPrice ?? product.originalPrice
  const discountAmount = displayOriginalPrice - displayPrice

  // ---------- UI ----------
  return (
    <div className='bg-slate-50 min-h-screen pb-12 pt-4'>
      <div className='container mx-auto px-4 max-w-7xl'>
        {/* Breadcrumb FPT Style (Gọn gàng) */}
        <nav
          className='flex items-center text-sm text-muted-foreground mb-4'
          aria-label='Breadcrumb'
        >
          <Link to='/' className='hover:text-primary flex items-center gap-1 transition-colors'>
            <Home className='h-4 w-4' />
            <span className='hidden sm:inline'>{t('nav.home')}</span>
          </Link>
          <ChevronRight className='h-4 w-4 mx-1.5 shrink-0' />
          <Link to='/products' className='hover:text-primary transition-colors whitespace-nowrap'>
            {product.category}
          </Link>
          <ChevronRight className='h-4 w-4 mx-1.5 shrink-0' />
          <span className='text-foreground font-medium truncate'>{product.name}</span>
        </nav>

        {/* Khối Thông tin chính (Nền trắng) */}
        <div className='bg-white rounded-xl shadow-sm border border-border/50 p-4 sm:p-6 mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-12 gap-8'>
            {/* Cột trái: Gallery (Chiếm 7 cột trên PC) */}
            <div className='md:col-span-7 h-fit'>
              <ImageGallery images={product.images} productName={product.name} />
            </div>

            {/* Cột phải: Thông tin, Giá, Nút bấm (Chiếm 5 cột trên PC) */}
            <div className='md:col-span-5 flex flex-col'>
              {/* Tên & rating */}
              <div className='border-b border-border/60 pb-4 mb-4'>
                <h1 className='text-2xl font-bold text-foreground mb-2 leading-tight'>
                  {product.name} {selectedVersion && <span>{selectedVersion}</span>}
                </h1>
                <div className='flex items-center gap-3 text-sm'>
                  <div className='flex items-center text-amber-500'>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-current' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                  <span className='text-blue-600 hover:underline cursor-pointer font-medium'>
                    {t('productDetail.reviews', { count: product.reviews })} đánh giá
                  </span>
                </div>
              </div>

              {/* Box Giá FPT Style */}
              <div className='flex items-end gap-3 mb-6'>
                <span className='text-3xl font-bold text-red-600'>{formatVnd(displayPrice)}</span>
                {discountAmount > 0 && (
                  <span className='text-base text-muted-foreground line-through mb-1 font-medium'>
                    {formatVnd(displayOriginalPrice)}
                  </span>
                )}
                {discountAmount > 0 && (
                  <span className='text-sm text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded mb-1.5 font-semibold'>
                    -{Math.round((discountAmount / displayOriginalPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Chọn version & màu */}
              <div className='space-y-4 mb-6'>
                {product.versions?.length > 0 && (
                  <VersionSelector
                    versions={product.versions}
                    selectedVersion={selectedVersion}
                    onSelect={setSelectedVersion}
                  />
                )}

                {product.colors?.length > 0 && (
                  <ColorSelector
                    colors={product.colors}
                    selectedColor={selectedColor}
                    onSelect={setSelectedColor}
                  />
                )}
              </div>

              {/* Box Khuyến Mãi Đặc Trưng FPT */}
              <div className='border border-red-200 rounded-lg overflow-hidden mb-6 bg-white'>
                <div className='bg-red-50 px-4 py-2 border-b border-red-200 flex items-center gap-2'>
                  <Gift className='h-5 w-5 text-red-600' />
                  <span className='font-bold text-red-600 uppercase text-sm'>
                    Khuyến mãi - Ưu đãi
                  </span>
                </div>
                <div className='p-4 text-sm flex flex-col gap-3'>
                  <div className='flex items-start gap-2'>
                    <Check className='h-4 w-4 text-green-500 mt-0.5 shrink-0' />
                    <span>
                      Giảm thêm <strong>500.000đ</strong> khi thanh toán qua thẻ tín dụng VNPAY
                    </span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <Check className='h-4 w-4 text-green-500 mt-0.5 shrink-0' />
                    <span>Tặng Balo Laptop VTech cao cấp trị giá 300.000đ</span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <Check className='h-4 w-4 text-green-500 mt-0.5 shrink-0' />
                    <span>Cơ hội trúng giải đặc biệt cuối tháng</span>
                  </div>
                </div>
              </div>

              <div className='flex flex-col gap-2.5'>
                <button
                  onClick={() => handleBuyNow(1)}
                  className='w-full bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg py-3.5 flex flex-col items-center justify-center transition-all shadow-md active:scale-[0.98]'
                >
                  <span className='text-lg font-bold uppercase'>Mua ngay</span>
                  <span className='text-xs font-medium'>Giao hàng miễn phí hoặc nhận tại shop</span>
                </button>

                <div className='flex gap-2.5'>
                  <button
                    onClick={() => handleAddToCart(1)}
                    className='flex-1 border-2 border-blue-600 bg-white hover:bg-blue-50 text-blue-600 rounded-lg py-2 flex flex-col items-center justify-center transition-all active:scale-[0.98]'
                  >
                    <span className='font-bold text-sm'>THÊM GIỎ HÀNG</span>
                  </button>
                  <button className='flex-1 border-2 border-blue-600 bg-white hover:bg-blue-50 text-blue-600 rounded-lg py-2 flex flex-col items-center justify-center transition-all active:scale-[0.98]'>
                    <span className='font-bold text-sm'>TRẢ GÓP 0%</span>
                  </button>
                </div>
              </div>

              {/* Chính sách mua hàng */}
              <div className='bg-slate-50 rounded-lg p-4 mt-6 text-sm flex flex-col gap-3 border border-border/60'>
                <div className='flex items-start gap-3'>
                  <ShieldCheck className='h-5 w-5 text-green-600 shrink-0' />
                  <span>
                    {t('productDetail.warranty')} chính hãng 12 tháng tại trung tâm uỷ quyền.
                  </span>
                </div>
                <div className='flex items-start gap-3'>
                  <Truck className='h-5 w-5 text-blue-600 shrink-0' />
                  <span>
                    {t('productDetail.exchange')} miễn phí 30 ngày nếu có lỗi từ nhà sản xuất.
                  </span>
                </div>
                {/* DÒNG MỚI ĐƯỢC THÊM VÀO ĐÂY */}
                <div className='flex items-start gap-3'>
                  <Headset className='h-5 w-5 text-purple-600 shrink-0' />
                  <span>Kỹ thuật viên hỗ trợ trực tuyến, giải đáp mọi thắc mắc về sản phẩm.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section (Tách thành 2 card trắng) */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Mô tả & đánh giá */}
          <div className='lg:col-span-8 space-y-6'>
            <div className='bg-white rounded-xl shadow-sm border border-border/50 p-4 sm:p-6'>
              <h2 className='text-xl font-bold mb-4 pb-2 border-b border-border/50'>
                Đặc điểm nổi bật
              </h2>
              <ProductDescription content={product.description} />
            </div>

            <div className='bg-white rounded-xl shadow-sm border border-border/50 p-4 sm:p-6'>
              <ProductReviews
                ratingAvg={product.rating}
                totalReviews={product.reviews}
                reviews={[]}
              />
            </div>
          </div>

          {/* Thông số kỹ thuật */}
          <div className='lg:col-span-4'>
            <div className='sticky top-24 bg-white rounded-xl shadow-sm border border-border/50 p-4 sm:p-6'>
              <h2 className='text-xl font-bold mb-4 pb-2 border-b border-border/50'>
                Thông số kỹ thuật
              </h2>
              <SpecsTable specs={product.specs} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
