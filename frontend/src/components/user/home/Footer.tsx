import { useTranslation } from 'react-i18next'
import { CreditCard, Wallet, Banknote, Smartphone, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function Footer() {
  const { t } = useTranslation('common')

  return (
    <footer className='bg-card border-t border-border mt-8'>
      <div className='container mx-auto px-3 sm:px-4 py-10'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
          {/* About */}
          <div>
            <h3 className='text-sm font-bold text-foreground mb-3 uppercase tracking-wide'>
              {t('footer.about.title')}
            </h3>
            <p className='text-sm text-muted-foreground mb-3 leading-relaxed'>
              {t('footer.about.intro')}
            </p>
            <ul className='space-y-2 text-sm'>
              <li>
                <a href='#' className='text-muted-foreground hover:text-primary'>
                  {t('footer.about.careers')}
                </a>
              </li>
              <li>
                <a href='#' className='text-muted-foreground hover:text-primary'>
                  {t('footer.about.stores')}
                </a>
              </li>
              <li>
                <a href='#' className='text-muted-foreground hover:text-primary'>
                  {t('footer.about.news')}
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className='text-sm font-bold text-foreground mb-3 uppercase tracking-wide'>
              {t('footer.support.title')}
            </h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <a href='#' className='text-muted-foreground hover:text-primary'>
                  {t('footer.support.warranty')}
                </a>
              </li>
              <li>
                <a href='#' className='text-muted-foreground hover:text-primary'>
                  {t('footer.support.shipping')}
                </a>
              </li>
              <li>
                <a href='#' className='text-muted-foreground hover:text-primary'>
                  {t('footer.support.installment')}
                </a>
              </li>
              <li>
                <a href='#' className='text-muted-foreground hover:text-primary'>
                  {t('footer.support.faq')}
                </a>
              </li>
            </ul>
          </div>

          {/* Payment */}
          <div>
            <h3 className='text-sm font-bold text-foreground mb-3 uppercase tracking-wide'>
              {t('footer.payment.title')}
            </h3>
            <p className='text-sm text-muted-foreground mb-3 leading-relaxed'>
              {t('footer.payment.desc')}
            </p>
            <div className='flex flex-wrap gap-2'>
              {[CreditCard, Wallet, Banknote, Smartphone].map((Icon, i) => (
                <div
                  key={i}
                  className='h-9 w-12 rounded border border-border bg-muted/40 flex items-center justify-center text-foreground/70'
                >
                  <Icon className='h-4 w-4' />
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className='text-sm font-bold text-foreground mb-3 uppercase tracking-wide'>
              {t('footer.newsletter.title')}
            </h3>
            <p className='text-sm text-muted-foreground mb-3 leading-relaxed'>
              {t('footer.newsletter.desc')}
            </p>
            <form onSubmit={(e) => e.preventDefault()} className='flex flex-col gap-2'>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  type='email'
                  placeholder={t('footer.newsletter.placeholder')}
                  className='pl-9 h-10'
                />
              </div>
              <Button type='submit' className='h-10 bg-primary hover:bg-primary-hover'>
                {t('footer.newsletter.subscribe')}
              </Button>
            </form>
          </div>
        </div>

        <div className='mt-10 pt-5 border-t border-border text-center text-xs text-muted-foreground'>
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  )
}
