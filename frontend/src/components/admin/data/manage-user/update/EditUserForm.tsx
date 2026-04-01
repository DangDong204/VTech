import {
  editUserSchema,
  type EditUserFormValues
} from '@/components/admin/data/manage-user/schema/user.schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ACCEPTED_IMAGE_TYPES } from '@/defines/upload-image'
import { UserRole, UserStatus } from '@/defines/user.enum'
import type { User } from '@/pages/admin/manage-user/columns'
import { updateUserApi } from '@/services/user/user.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { Separator } from '@radix-ui/react-select'
import { FolderEdit } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAppMutation } from '@/hooks/useAppMutation'

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
    setValue,
    formState: { errors }
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: user.username,
      fullName: user.fullName ?? '',
      phone: user.phone ?? '',
      status: user.status,
      roles: user.roles?.filter((r): r is UserRole =>
        Object.values(UserRole).includes(r as UserRole)
      )
    }
  })

  const mutation = useAppMutation(
    (values: EditUserFormValues) => updateUserApi(user.id, values),
    'users',
    t('message.success.update'),
    t('message.error.update'),
    onSuccess
  )

  const onSubmit = (values: EditUserFormValues) => {
    mutation.mutate(values)
  }

  const [preview, setPreview] = useState<string | null>(user.avatar ?? null)

  return (
    <Card className='border-none shadow-none px-5'>
      <CardHeader className='px-0 pt-0'>
        <div className='flex items-center gap-2'>
          <FolderEdit className='h-5 w-5 text-primary' />
          <CardTitle>{t('dialogTitle.update')}</CardTitle>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className='px-0 pt-6'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 items-start'>
            {/* LEFT */}
            <div className='md:col-span-2 space-y-5'>
              <div className='space-y-2'>
                <Label>{t('fields.username.label')}</Label>
                <Input
                  {...register('username')}
                  className={errors.username ? 'border-destructive' : ''}
                />
                {errors.username && (
                  <p className='text-sm text-destructive'>{errors.username.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label>{t('fields.fullName.label')}</Label>
                <Input {...register('fullName')} />
              </div>

              <div className='space-y-2'>
                <Label>{t('fields.phone.label')}</Label>
                <Input
                  {...register('phone')}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && <p className='text-sm text-destructive'>{errors.phone.message}</p>}
              </div>

              <div className='grid grid-cols-2 gap-4'>
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
                  {errors.roles && (
                    <p className='text-sm text-destructive'>{errors.roles.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT - IMAGE */}
            <div className='space-y-2'>
              <Label>{t('fields.avatar.label')}</Label>

              <label
                htmlFor='avatar'
                className={`block w-full aspect-square rounded-md border bg-muted overflow-hidden cursor-pointer relative group
                  ${errors.avatar ? 'border-destructive' : ''}`}
              >
                {preview ? (
                  <img src={preview} className='object-cover w-full h-full' />
                ) : (
                  <div className='flex items-center justify-center h-full text-muted-foreground text-sm'>
                    {t('fields.avatar.placeholder')}
                  </div>
                )}

                <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-sm'></div>
              </label>

              <Input
                id='avatar'
                type='file'
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                className='hidden'
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  setPreview(URL.createObjectURL(file))
                  setValue('avatar', file, { shouldValidate: true })
                }}
              />

              {errors.avatar && <p className='text-sm text-destructive'>{errors.avatar.message}</p>}
            </div>
          </div>

          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button type='submit' disabled={mutation.isPending}>
              <FolderEdit className='mr-2 h-4 w-4' />
              {t('actions.edit')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
