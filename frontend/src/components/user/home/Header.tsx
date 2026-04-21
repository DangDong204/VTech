import { Search, MapPin, ShoppingCart, User, Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LanguageSelector from '@/components/common/LanguageSelector'
import { useCart } from '@/contexts/CartContext'
import { Link } from 'react-router'

export function Header() {
  const { t } = useTranslation('common')

  const { totalCount } = useCart()

  return (
    <header className='sticky top-0 z-50 bg-primary text-primary-foreground shadow-md'>
      <div className='container mx-auto px-3 sm:px-4'>
        <div className='flex h-14 items-center gap-2 sm:gap-4 lg:h-16'>
          {/* Mobile menu */}
          <Button
            variant='ghost'
            size='icon'
            className='lg:hidden text-primary-foreground hover:bg-white/10 hover:text-primary-foreground h-9 w-9'
          >
            <Menu className='h-5 w-5' />
          </Button>

          {/* Logo */}
          <a href='/' className='flex items-center gap-1 shrink-0'>
            <span className='text-xl sm:text-2xl font-extrabold tracking-tight'>
              V<span className='text-accent'>Tech</span>
            </span>
          </a>

          {/* Search */}
          <div className='flex-1 max-w-2xl mx-1 sm:mx-2'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder={t('header.searchPlaceholder')}
                className='h-9 lg:h-10 pl-9 pr-3 bg-background text-foreground border-0 rounded-md focus-visible:ring-2 focus-visible:ring-accent placeholder:text-muted-foreground'
              />
            </div>
          </div>

          {/* Right actions */}
          <div className='flex items-center gap-0.5 sm:gap-1 shrink-0'>
            <LanguageSelector />

            <Button
              variant='ghost'
              size='sm'
              className='hidden md:flex h-9 gap-1.5 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground px-2'
            >
              <MapPin className='h-4 w-4' />
              <span className='text-xs hidden lg:inline max-w-[120px] truncate'>
                {t('header.location')}
              </span>
            </Button>

            <Button
              asChild
              variant='ghost'
              size='sm'
              className='relative h-9 gap-1.5 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground px-2'
            >
              <Link to='/cart'>
                <ShoppingCart className='h-5 w-5' />
                {totalCount > 0 && (
                  <Badge className='absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full pointer-events-none'>
                    {totalCount}
                  </Badge>
                )}
                <span className='hidden lg:inline text-xs'>{t('header.cart')}</span>
              </Link>
            </Button>

            <Button
              asChild
              variant='ghost'
              size='sm'
              className='h-9 gap-1.5 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground px-2'
            >
              <Link to='/login'>
                <User className='h-5 w-5' />
                <span className='hidden lg:inline text-xs'>{t('header.login')}</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
