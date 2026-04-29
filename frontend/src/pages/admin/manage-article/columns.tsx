import { DataTableColumnHeader } from '@/components/admin/datatable/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import { IMGAE_NOT_FOUND } from '@/defines/upload-image'
import i18n from '@/i18n/i18n'
import type { ArticleResponse } from '@/services/article/article.type'
import { type ColumnDef } from '@tanstack/react-table'
import { ArticleStatusBadge } from '@/components/admin/data/manage-article/ArticleStatusBadge'
import { ArticleActionsCell } from '@/components/admin/action/ArticleActionsCell'

export const columns: ColumnDef<ArticleResponse>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('article:table.columns.title')} />
    ),
    cell: ({ row }) => {
      const article = row.original
      return (
        <div className='flex items-center gap-3'>
          <img
            src={article.thumbnail ?? IMGAE_NOT_FOUND}
            alt={article.title}
            className='h-10 w-16 rounded object-cover border flex-shrink-0'
          />
          <div className='flex flex-col max-w-[300px]'>
            <span className='font-medium truncate' title={article.title}>
              {article.title}
            </span>
            <span className='text-xs text-muted-foreground truncate'>{article.slug}</span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'authorName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('article:table.columns.author')} />
    ),
    cell: ({ row }) => <span className='text-sm'>{row.original.authorName}</span>
  },
  {
    accessorKey: 'viewCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('article:table.columns.views')} />
    ),
    cell: ({ row }) => (
      <span className='text-sm font-medium'>{row.original.viewCount.toLocaleString()}</span>
    )
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={i18n.t('article:table.columns.status')} />
    ),
    cell: ({ row }) => <ArticleStatusBadge status={row.getValue('status')} />
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>{i18n.t('article:table.columns.actions')}</div>,
    cell: ({ row }) => <ArticleActionsCell article={row.original} />,
    enableSorting: false,
    enableHiding: false
  }
]
