export function ProductSkeleton() {
  return (
    <div className='bg-card rounded-xl border border-border p-3 flex flex-col h-full animate-pulse'>
      <div className='w-14 h-4 bg-muted rounded mb-4'></div>
      <div className='w-full aspect-square bg-muted rounded-md mb-4'></div>
      <div className='space-y-2 mt-2'>
        <div className='w-3/4 h-4 bg-muted rounded'></div>
        <div className='w-1/2 h-4 bg-muted rounded'></div>
      </div>
      <div className='mt-4 space-y-2'>
        <div className='w-full h-6 bg-muted rounded'></div>
        <div className='w-full h-6 bg-muted rounded'></div>
      </div>
      <div className='mt-auto pt-4 flex justify-between'>
        <div className='w-16 h-4 bg-muted rounded'></div>
        <div className='w-8 h-8 bg-muted rounded-full'></div>
      </div>
    </div>
  )
}
