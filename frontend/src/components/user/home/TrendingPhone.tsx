// import { useTranslation } from 'react-i18next'
// import { ChevronRight } from 'lucide-react'
// import { ProductCard, type Product } from './ProductCard'

// const products: Product[] = [
//   {
//     id: 't1',
//     name: 'iPhone 16 Pro 128GB Desert Titanium',
//     price: 28990000,
//     originalPrice: 30990000,
//     rating: 5,
//     reviews: 412,
//     discount: 7,
//     hue: 50
//   },
//   {
//     id: 't2',
//     name: 'Samsung Galaxy Z Flip6 256GB',
//     price: 24990000,
//     originalPrice: 27990000,
//     rating: 5,
//     reviews: 188,
//     discount: 11,
//     hue: 320
//   },
//   {
//     id: 't3',
//     name: 'Google Pixel 9 Pro 256GB Hazel',
//     price: 22490000,
//     originalPrice: 25990000,
//     rating: 4,
//     reviews: 96,
//     discount: 13,
//     hue: 140
//   },
//   {
//     id: 't4',
//     name: 'OPPO Reno12 Pro 5G 12GB/512GB',
//     price: 13990000,
//     originalPrice: 16990000,
//     rating: 4,
//     reviews: 240,
//     discount: 18,
//     hue: 180
//   },
//   {
//     id: 't5',
//     name: 'Xiaomi Redmi Note 14 Pro 8GB/256GB',
//     price: 7490000,
//     originalPrice: 8990000,
//     rating: 4,
//     reviews: 510,
//     discount: 17,
//     hue: 20
//   },
//   {
//     id: 't6',
//     name: 'Vivo V40 Lite 5G 8GB/256GB',
//     price: 8990000,
//     originalPrice: 9990000,
//     rating: 4,
//     reviews: 132,
//     discount: 10,
//     hue: 290
//   },
//   {
//     id: 't7',
//     name: 'Realme GT Neo 6 12GB/256GB',
//     price: 11490000,
//     originalPrice: 13990000,
//     rating: 4,
//     reviews: 78,
//     discount: 18,
//     hue: 100
//   },
//   {
//     id: 't8',
//     name: 'Honor Magic V3 16GB/512GB Foldable',
//     price: 38990000,
//     originalPrice: 44990000,
//     rating: 5,
//     reviews: 45,
//     discount: 13,
//     hue: 0
//   },
//   {
//     id: 't9',
//     name: 'Nothing Phone (2a) 8GB/128GB',
//     price: 7990000,
//     originalPrice: 9490000,
//     rating: 4,
//     reviews: 220,
//     discount: 16,
//     hue: 240
//   },
//   {
//     id: 't10',
//     name: 'ASUS ROG Phone 8 Pro 16GB/512GB',
//     price: 27990000,
//     originalPrice: 31990000,
//     rating: 5,
//     reviews: 64,
//     discount: 13,
//     hue: 15
//   }
// ]

// export function TrendingPhones() {
//   const { t } = useTranslation('common')

//   return (
//     <section className='bg-card rounded-xl border border-border p-4 sm:p-5'>
//       <div className='flex items-center justify-between mb-4'>
//         <h2 className='text-lg sm:text-xl font-bold text-foreground'>{t('home.trendingPhones')}</h2>
//         <a
//           href='#'
//           className='text-sm text-primary font-medium hover:underline inline-flex items-center gap-0.5'
//         >
//           {t('home.viewAll')}
//           <ChevronRight className='h-4 w-4' />
//         </a>
//       </div>

//       <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'>
//         {products.map((p) => (
//           <ProductCard key={p.id} product={p} />
//         ))}
//       </div>
//     </section>
//   )
// }
