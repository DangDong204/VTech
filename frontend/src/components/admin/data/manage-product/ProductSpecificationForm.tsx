import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

// Định nghĩa kiểu dữ liệu cụ thể cho Form Context của component này
interface SpecFormContext {
  specs: {
    label: string
    value: string
  }[]
}

export function ProductSpecificationForm() {
  // Truyền kiểu SpecFormContext vào để TypeScript tự động hiểu cấu trúc của errors
  const {
    control,
    register,
    formState: { errors }
  } = useFormContext<SpecFormContext>()

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'specs'
  })

  // State lưu giữ index của item đang được kéo
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Xử lý đổi vị trí liên tục khi rê item đi qua item khác
  const handleDragEnter = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      move(draggedIndex, index)
      setDraggedIndex(index) // Cập nhật lại index mới sau khi move
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between border-b pb-3'>
        <div>
          <Label className='text-base font-semibold text-primary'>Thông số kỹ thuật</Label>
          <p className='text-[11px] text-muted-foreground mt-1'>
            Thêm và <strong className='text-foreground'>kéo thả</strong> để sắp xếp thứ tự hiển thị.
          </p>
        </div>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => append({ label: '', value: '' })}
        >
          <Plus className='w-4 h-4 mr-2' /> Thêm dòng
        </Button>
      </div>

      <div className='space-y-2 pt-2 max-h-[350px] overflow-y-auto pr-2'>
        {fields.length === 0 ? (
          <div className='text-center py-8 text-sm text-muted-foreground border border-dashed rounded-md bg-muted/20'>
            Chưa có thông số nào. Nhấn "Thêm dòng" để bắt đầu.
          </div>
        ) : (
          fields.map((field, index) => {
            // TypeScript đã tự hiểu đây là FieldError của mảng, không cần dùng as any nữa
            const fieldError = errors.specs?.[index]
            const isDragging = draggedIndex === index

            return (
              <div
                key={field.id}
                draggable // Bật tính năng kéo thả HTML5
                onDragStart={() => setDraggedIndex(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={() => setDraggedIndex(null)}
                onDragOver={(e) => e.preventDefault()} // Cần thiết để cho phép thả (drop)
                className={`flex items-start gap-2 p-2 transition-all rounded-md bg-background ${
                  isDragging
                    ? 'opacity-40 shadow-inner scale-[0.98]'
                    : 'hover:bg-muted/40 border border-transparent hover:border-border'
                }`}
              >
                {/* Nút cầm để kéo */}
                <div className='mt-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0'>
                  <GripVertical className='w-4 h-4' />
                </div>

                <div className='flex-1 space-y-1'>
                  <Input
                    placeholder='Tên (VD: Màu sắc)'
                    className={fieldError?.label ? 'border-destructive' : ''}
                    {...register(`specs.${index}.label` as const)}
                  />
                </div>

                <div className='flex-1 space-y-1'>
                  <Input
                    placeholder='Giá trị (VD: Đen Titan)'
                    className={fieldError?.value ? 'border-destructive' : ''}
                    {...register(`specs.${index}.value` as const)}
                  />
                </div>

                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => remove(index)}
                  className='text-muted-foreground hover:text-red-600 hover:bg-red-50 mt-0.5 shrink-0'
                >
                  <Trash2 className='w-4 h-4' />
                </Button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
