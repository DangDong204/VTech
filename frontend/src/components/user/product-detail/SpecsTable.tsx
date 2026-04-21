export interface Spec {
  label: string
  value: string
}

interface SpecsTableProps {
  specs: Spec[]
}

export function SpecsTable({ specs }: SpecsTableProps) {
  if (!specs || specs.length === 0) return null

  return (
    <div className='bg-card border border-border rounded-lg p-4 sm:p-6'>
      <h2 className='text-lg font-bold mb-4'>Thông số kỹ thuật</h2>
      <div className='w-full overflow-hidden rounded-md border border-border'>
        <table className='w-full text-sm text-left'>
          <tbody>
            {specs.map((spec, idx) => (
              <tr
                key={idx}
                className={`border-b border-border last:border-0 ${
                  idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'
                }`}
              >
                <td className='px-4 py-3 font-medium text-foreground w-[40%] align-top'>
                  {spec.label}
                </td>
                <td className='px-4 py-3 text-muted-foreground align-top'>{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
