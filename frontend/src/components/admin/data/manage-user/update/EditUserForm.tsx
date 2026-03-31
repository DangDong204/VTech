import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { UserRole, UserStatus } from '@/defines/user.enum'
import type { User } from '@/pages/admin/manage-user/columns'
import { updateUserApi } from '@/services/user/user.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  editUserSchema,
  type EditUserFormValues
} from '@/components/admin/data/manage-user/schema/user.schema'

interface EditUserFormProps {
  user: User
  onSuccess: () => void
}

export function EditUserForm({ user, onSuccess }: EditUserFormProps) {
  const { t } = useTranslation('user')
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: user.username,
      fullName: user.fullName ?? '',
      phone: user.phone ?? '',
      avatar: user.avatar ?? '',
      status: user.status,
      roles: user.roles?.filter((r): r is UserRole =>
        Object.values(UserRole).includes(r as UserRole)
      )
    }
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (values: EditUserFormValues) =>
      updateUserApi(user.id, {
        username: values.username,
        fullName: values.fullName,
        phone: values.phone,
        avatar: values.avatar,
        status: values.status,
        roles: values.roles
      }),
    onSuccess: () => {
      toast.success(t('message.success.update'))
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onSuccess()
    },
    onError: () => {
      toast.error(t('message.error.update'))
    }
  })

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label>{t('fields.username.label')}</Label>
          <Input {...register('username')} />
          {errors.username && <p className='text-destructive text-sm'>{errors.username.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.fullName.label')}</Label>
          <Input {...register('fullName')} />
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.phone.label')}</Label>
          <Input {...register('phone')} />
          {errors.phone && <p className='text-destructive text-sm'>{errors.phone.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.avatar.label')}</Label>
          <Input {...register('avatar')} />
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.status.label')}</Label>
          <Controller
            control={control}
            name='status'
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(UserStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`fields.status.options.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.role.label')}</Label>
          <Controller
            control={control}
            name='roles'
            render={({ field }) => (
              <Select
                value={field.value?.[0]}
                onValueChange={(value) => field.onChange([value as UserRole])}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('fields.role.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(UserRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {t(`fields.role.options.${role}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.roles && <p className='text-destructive text-sm'>{errors.roles.message}</p>}
        </div>
      </div>
      <div className='flex justify-end'>
        <Button type='submit' disabled={mutation.isPending}>
          {t('actions.edit')}
        </Button>
      </div>
    </form>
  )
}
