import { BrandCarousel } from '@/components/user/home/BrandCarousel'
import { CategorySidebar } from '@/components/user/home/CategorySidebar'
import { FlashSale } from '@/components/user/home/FlashSale'
import { HeroBanner } from '@/components/user/home/HeroBanner'
import { PolicyBanner } from '@/components/user/home/PolicyBanner'
import { TechNewsSection } from '@/components/user/home/TechNewSection'

export default function HomePage() {
  return (
    <div className='container mx-auto flex flex-col gap-6 lg:gap-8 px-4 pt-4'>
      <section className='flex flex-col lg:flex-row gap-4'>
        <div className='hidden lg:block lg:w-[220px] xl:w-[240px] shrink-0'>
          <CategorySidebar />
        </div>
        <div className='flex-1 min-w-0'>
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

      <section className='pb-8'>
        <TechNewsSection />
      </section>
    </div>
  )
}
