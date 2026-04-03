import { CategoryStatusBadge } from '@/components/admin/data/manage-category/CategoryStatusBadges'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IMGAE_NOT_FOUND } from '@/defines/upload-image'
import type { Category } from '@/pages/admin/manage-category/columns'
import { useTranslation } from 'react-i18next'

interface ViewCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category
}

export function ViewCategoryDialog({ open, onOpenChange, category }: ViewCategoryDialogProps) {
  const { t } = useTranslation('category')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>{t('titles.view')}</DialogTitle>
        </DialogHeader>

        <div className='max-h-[80vh] overflow-y-auto px-6 pb-6'>
          <div className='space-y-4'>
            {/* IMAGE giống edit */}
            <div className='space-y-2'>
              <Label>{t('fields.thumbnailUrl.label')}</Label>
              <div className='w-full aspect-video rounded-md border bg-muted overflow-hidden'>
                <img
                  src={category.thumbnailUrl ?? IMGAE_NOT_FOUND}
                  alt={category.categoryName}
                  className='object-cover w-full h-full'
                />
              </div>
            </div>

            {/* GRID giống edit */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>{t('fields.categoryName.label')}</Label>
                <Input value={category.categoryName} disabled />
              </div>

              <div className='space-y-2'>
                <Label>{t('fields.slug.label')}</Label>
                <Input value={category.slug} disabled />
              </div>

              <div className='space-y-2'>
                <Label>{t('fields.displayOrder.label')}</Label>
                <Input value={category.displayOrder ?? ''} disabled />
              </div>

              <div className='space-y-2'>
                <Label>{t('fields.parent.label')}</Label>
                <Input value={category.parentName ?? '-'} disabled />
              </div>

              <div className='space-y-2'>
                <Label>{t('fields.status.label')}</Label>
                <div className='pt-2'>
                  <CategoryStatusBadge status={category.status} />
                </div>
              </div>

              <div className='space-y-2 md:col-span-2'>
                <Label>{t('fields.categoryDesc.label')}</Label>
                <Input value={category.categoryDesc ?? ''} disabled />
              </div>
            </div>

            {/* created/updated */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2'>
              <div className='space-y-1'>
                <Label className='text-muted-foreground text-xs'>{t('fields.createdAt')}</Label>
                <p className='text-muted-foreground'>{category.createdAt}</p>
              </div>

              <div className='space-y-1'>
                <Label className='text-muted-foreground text-xs'>{t('fields.updatedAt')}</Label>
                <p className='text-muted-foreground'>{category.updatedAt}</p>
              </div>
            </div>

            {/* ACTION */}
            <div className='flex justify-end pt-4'>
              <Button variant='outline' onClick={() => onOpenChange(false)}>
                {t('actions.close')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
