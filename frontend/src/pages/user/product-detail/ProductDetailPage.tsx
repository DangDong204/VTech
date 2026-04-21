import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronRight, Home, Star } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/contexts/CartContext'
import { ImageGallery } from '@/components/user/product-detail/ImageGallery'
import { VersionSelector } from '@/components/user/product-detail/VersionSelector'
import { ColorSelector } from '@/components/user/product-detail/ColorSelector'
import { ActionArea } from '@/components/user/product-detail/ActionArea'
import { ProductDescription } from '@/components/user/product-detail/ProductDesc'
import { ProductReviews } from '@/components/user/product-detail/ProductReview'
import { SpecsTable } from '@/components/user/product-detail/SpecsTable'
import { useTranslation } from 'react-i18next'

// Mock Data (Sau này sẽ fetch bằng id từ useParams)
const mockProductDetail = {
  id: 'oppo-a6-pro',
  name: 'OPPO A6 Pro',
  category: 'Điện thoại', // THÊM trường category cho Breadcrumb
  price: 34990000,
  originalPrice: 36990000,
  rating: 4.8,
  reviews: 342,
  images: [
    'https://vtech-image-ndd.s3.ap-southeast-2.amazonaws.com/product/oppo-a6-pro/oppo-a6-pro-hong-1.webp',
    'https://vtech-image-ndd.s3.ap-southeast-2.amazonaws.com/product/oppo-a6-pro/oppo-a6-pro-hong-2.webp',
    'https://vtech-image-ndd.s3.ap-southeast-2.amazonaws.com/product/oppo-a6-pro/oppo-a6-pro-hong-3.webp',
    'https://vtech-image-ndd.s3.ap-southeast-2.amazonaws.com/product/oppo-a6-pro/oppo-a6-pro-hong-4.webp',
    'https://vtech-image-ndd.s3.ap-southeast-2.amazonaws.com/product/oppo-a6-pro/oppo-a6-pro-hong-5.webp',
    'https://vtech-image-ndd.s3.ap-southeast-2.amazonaws.com/product/oppo-a6-pro/oppo-a6-pro-hong-6.webp'
  ],
  versions: ['256GB', '512GB', '1TB'],
  colors: [
    { name: 'Titan tự nhiên', hex: '#d0c8b6' },
    { name: 'Titan trắng', hex: '#f2f2f0' },
    { name: 'Titan đen', hex: '#444341' }
  ],
  description: `iPhone 16 Pro Max sở hữu thiết kế titan đúc nguyên khối đẳng cấp, nhẹ hơn và bền bỉ hơn.
  
  Trang bị con chip Apple A18 Pro mạnh mẽ nhất từ trước đến nay, mang lại trải nghiệm chiến game đồ họa cao và xử lý AI mượt mà chưa từng có. 
  Hệ thống camera 48MP được nâng cấp toàn diện, cho phép quay video 4K Dolby Vision đỉnh cao.
  Thời lượng pin cải thiện đáng kể, đồng hành cùng bạn suốt cả ngày dài.`,
  specs: [
    { label: 'Màn hình', value: '6.9 inch, Super Retina XDR OLED, 120Hz' },
    { label: 'Hệ điều hành', value: 'iOS 18' },
    { label: 'Chip xử lý (CPU)', value: 'Apple A18 Pro 6 nhân' },
    { label: 'RAM', value: '8 GB' },
    { label: 'Dung lượng pin', value: '4676 mAh, Sạc nhanh 25W' },
    { label: 'Camera sau', value: 'Chính 48 MP & Phụ 12 MP, 12 MP' }
  ],
  reviewsList: [
    {
      id: 1,
      userName: 'Nguyễn Đăng Đông',
      rating: 5,
      date: '20/04/2026',
      content:
        'Sản phẩm quá đẹp, chụp ảnh ban đêm cực kỳ xuất sắc. Máy chơi game mát, không bị quá nhiệt như dòng cũ.'
    },
    {
      id: 2,
      userName: 'Trần Văn A',
      rating: 4,
      date: '18/04/2026',
      content: 'Máy ngon nhưng giá hơi chát. Giao hàng của VTech siêu nhanh, đóng gói cẩn thận.'
    }
  ]
}

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫'
}

export default function ProductDetailPage() {
  // const { slug } = useParams() // Lấy slug từ URL sau này để fetch API
  const navigate = useNavigate()
  const { addItem } = useCart()

  const { t } = useTranslation('common')

  const product = mockProductDetail // Gắn mock data

  // States quản lý biến thể
  const [selectedVersion, setSelectedVersion] = useState(product.versions[0])
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name)

  const handleAddToCart = (quantity: number) => {
    addItem(
      {
        id: `${product.id}-${selectedVersion}-${selectedColor}`, // Tạo ID unique cho từng biến thể trong giỏ
        name: `${product.name} ${selectedVersion}`,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images[0],
        variant: { color: selectedColor, storage: selectedVersion }
      },
      quantity
    )
    toast.success('Đã thêm sản phẩm vào giỏ hàng!')
  }

  const handleBuyNow = (quantity: number) => {
    handleAddToCart(quantity)
    navigate('/cart') // Thêm vào giỏ xong thì bay sang trang Giỏ hàng luôn
  }

  return (
    <div className='container mx-auto px-4 py-6 md:py-10 max-w-7xl'>
      <nav className='flex items-center text-sm text-muted-foreground mb-6' aria-label='Breadcrumb'>
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
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12'>
        {/* CỘT TRÁI: Thư viện ảnh */}
        <div className='md:sticky md:top-24 h-fit'>
          <ImageGallery images={product.images} productName={product.name} />
        </div>

        {/* CỘT PHẢI: Chi tiết sản phẩm */}
        <div className='flex flex-col gap-6'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-foreground mb-2'>
              {product.name} {selectedVersion}
            </h1>
            <div className='flex items-center gap-2 text-sm'>
              <div className='flex items-center text-warning'>
                <Star className='h-4 w-4 fill-current' />
                <span className='ml-1 font-medium'>{product.rating}</span>
              </div>
              <span className='text-muted-foreground'>
                ({t('productDetail.reviews', { count: product.reviews })})
              </span>
            </div>
          </div>

          <div className='flex items-end gap-3 p-4 bg-muted/50 rounded-lg'>
            <span className='text-3xl font-bold text-primary'>{formatVnd(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className='text-base text-muted-foreground line-through mb-1'>
                {formatVnd(product.originalPrice)}
              </span>
            )}
          </div>

          <VersionSelector
            versions={product.versions}
            selectedVersion={selectedVersion}
            onSelect={setSelectedVersion}
          />

          <ColorSelector
            colors={product.colors}
            selectedColor={selectedColor}
            onSelect={setSelectedColor}
          />

          <ActionArea onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />

          {/* Dải thông tin bảo hành (Tĩnh) */}
          <div className='grid grid-cols-2 gap-4 pt-4 border-t border-border mt-2 text-sm'>
            <div className='flex items-center gap-2'>
              <span className='p-1.5 bg-primary/10 text-primary rounded-full'>🛡️</span>
              {t('productDetail.warranty')}
            </div>
            <div className='flex items-center gap-2'>
              <span className='p-1.5 bg-primary/10 text-primary rounded-full'>🔄</span>
              {t('productDetail.exchange')}
            </div>
          </div>
        </div>
      </div>
      <div className='mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* CỘT TRÁI (Chiếm 8 phần): Mô tả và Đánh giá */}
        <div className='lg:col-span-8 space-y-6'>
          <ProductDescription content={product.description} />

          <ProductReviews
            ratingAvg={product.rating}
            totalReviews={product.reviews}
            reviews={product.reviewsList}
          />
        </div>

        {/* CỘT PHẢI (Chiếm 4 phần): Bảng Thông số kỹ thuật */}
        <div className='lg:col-span-4'>
          <div className='sticky top-24'>
            <SpecsTable specs={product.specs} />
          </div>
        </div>
      </div>
    </div>
  )
}
