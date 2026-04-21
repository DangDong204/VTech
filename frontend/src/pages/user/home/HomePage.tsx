import { BrandCarousel } from '@/components/user/home/BrandCarousel'
import { CategorySidebar } from '@/components/user/home/CategorySidebar'
import { FlashSale } from '@/components/user/home/FlashSale'
import { HeroBanner } from '@/components/user/home/HeroBanner'
import { PolicyBanner } from '@/components/user/home/PolicyBanner'
import { TechNewsSection } from '@/components/user/home/TechNewSection'
import { TrendingPhones } from '@/components/user/home/TrendingPhone'

export default function HomePage() {
  return (
    <div className='container mx-auto flex flex-col gap-8 px-4'>
      <section className='grid grid-cols-1 gap-4 md:grid-cols-4 lg:gap-6'>
        <div className='hidden md:block md:col-span-1'>
          <CategorySidebar />
        </div>
        <div className='col-span-1 md:col-span-3'>
          <HeroBanner />
        </div>
      </section>

      <section>
        <PolicyBanner />
      </section>

      <section>
        <FlashSale />
      </section>

      <section>
        <BrandCarousel />
      </section>

      <section>
        <TrendingPhones />
      </section>

      <section className='pb-8'>
        <TechNewsSection />
      </section>
    </div>
  )
}
