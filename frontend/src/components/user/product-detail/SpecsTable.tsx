import { useState } from 'react'
import { X, ChevronRight, Cpu, Monitor, Camera, Battery, Wifi, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Spec {
  label: string
  value: string
}

interface SpecsTableProps {
  specs: Spec[]
}

// Map nhóm thông số theo từ khoá trong label
const SPEC_GROUPS: { name: string; icon: React.ReactNode; keywords: string[] }[] = [
  {
    name: 'Màn hình',
    icon: <Monitor className='h-4 w-4' />,
    keywords: ['màn hình', 'độ phân giải', 'công nghệ màn']
  },
  {
    name: 'Hiệu năng',
    icon: <Cpu className='h-4 w-4' />,
    keywords: ['chip', 'cpu', 'gpu', 'ram', 'bộ nhớ', 'hệ điều']
  },
  {
    name: 'Camera',
    icon: <Camera className='h-4 w-4' />,
    keywords: ['camera']
  },
  {
    name: 'Pin & Sạc',
    icon: <Battery className='h-4 w-4' />,
    keywords: ['pin', 'sạc']
  },
  {
    name: 'Kết nối',
    icon: <Wifi className='h-4 w-4' />,
    keywords: ['kết nối', 'bluetooth', 'wifi', 'usb', '5g', '4g']
  },
  {
    name: 'Thiết kế & Khác',
    icon: <Package className='h-4 w-4' />,
    keywords: []
  }
]

function groupSpecs(specs: Spec[]) {
  const grouped: { group: (typeof SPEC_GROUPS)[0]; specs: Spec[] }[] = SPEC_GROUPS.map((g) => ({
    group: g,
    specs: []
  }))

  specs.forEach((spec) => {
    const lower = spec.label.toLowerCase()
    let placed = false
    for (let i = 0; i < SPEC_GROUPS.length - 1; i++) {
      if (SPEC_GROUPS[i].keywords.some((kw) => lower.includes(kw))) {
        grouped[i].specs.push(spec)
        placed = true
        break
      }
    }
    if (!placed) grouped[grouped.length - 1].specs.push(spec)
  })

  return grouped.filter((g) => g.specs.length > 0)
}

// ---------- Sheet (Drawer) ----------
function SpecSheet({
  open,
  onClose,
  specs
}: {
  open: boolean
  onClose: () => void
  specs: Spec[]
}) {
  const groups = groupSpecs(specs)

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sheet panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-slate-800 to-slate-900 text-white'>
          <h2 className='text-lg font-bold'>Thông số kỹ thuật đầy đủ</h2>
          <button
            onClick={onClose}
            className='rounded-full p-1.5 hover:bg-white/20 transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto px-6 py-4 space-y-6'>
          {groups.map(({ group, specs: groupSpecs }) => (
            <div key={group.name}>
              {/* Group header */}
              <div className='flex items-center gap-2 mb-3'>
                <span className='text-red-500'>{group.icon}</span>
                <h3 className='font-bold text-sm text-foreground uppercase tracking-wide'>
                  {group.name}
                </h3>
              </div>

              <div className='rounded-xl overflow-hidden border border-border'>
                {groupSpecs.map((spec, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex gap-4 px-4 py-3 text-sm border-b border-border/60 last:border-0',
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    )}
                  >
                    <span className='w-[40%] font-medium text-slate-600 shrink-0'>
                      {spec.label}
                    </span>
                    <span className='text-foreground font-medium'>{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ---------- Main component ----------
const PREVIEW_COUNT = 6

export function SpecsTable({ specs }: SpecsTableProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  if (!specs || specs.length === 0) return null

  const previewSpecs = specs.slice(0, PREVIEW_COUNT)
  const hasMore = specs.length > PREVIEW_COUNT

  return (
    <>
      <div>
        <div className='rounded-xl overflow-hidden border border-border mb-3'>
          {previewSpecs.map((spec, idx) => (
            <div
              key={idx}
              className={cn(
                'flex gap-4 px-4 py-3 text-sm border-b border-border/60 last:border-0',
                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              )}
            >
              <span className='w-[45%] font-medium text-slate-500 shrink-0 text-xs leading-5'>
                {spec.label}
              </span>
              <span className='text-foreground text-xs leading-5 font-medium'>{spec.value}</span>
            </div>
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => setSheetOpen(true)}
            className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-red-500 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors'
          >
            Xem tất cả {specs.length} thông số
            <ChevronRight className='h-4 w-4' />
          </button>
        )}
      </div>

      <SpecSheet open={sheetOpen} onClose={() => setSheetOpen(false)} specs={specs} />
    </>
  )
}
