import { ReviewDetailModal } from '@/components/admin/data/manage-review/ReviewDetailModal'
import { Button } from '@/components/ui/button'
import type { ReviewResponse } from '@/services/review/review.type'
import { Eye } from 'lucide-react'
import { useState } from 'react'

interface ReviewActionProps {
  review: ReviewResponse
}

export function ReviewActionsCell({ review }: ReviewActionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className='flex items-center justify-center'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setIsModalOpen(true)}
          className='h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
          title='Xem chi tiết'
        >
          <Eye className='h-4 w-4' />
        </Button>
      </div>

      <ReviewDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        review={review}
      />
    </>
  )
}
