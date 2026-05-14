'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'

const schema = z.object({
  category:    z.enum(['lashes', 'brows', 'pmu', 'addons']),
  group_label: z.string().nullable(),
  name:        z.string().min(1, 'Name is required'),
  duration:    z.string().min(1, 'Duration is required'),
  price:       z.string().min(1, 'Price is required'),
})

type FormValues = z.infer<typeof schema>

type Props = {
  initial?: Partial<FormValues & { id: string }>
  onClose: () => void
  onSaved: () => void
}

export function ServiceForm({ initial, onClose, onSaved }: Props) {
  const isEdit = !!initial?.id
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category:    initial?.category    ?? 'lashes',
      group_label: (initial?.group_label ?? null) as string | null,
      name:        initial?.name        ?? '',
      duration:    initial?.duration    ?? '',
      price:       initial?.price       ?? '',
    },
  })

  async function onSubmit(values: FormValues) {
    const url    = isEdit ? `/api/admin/services/${initial!.id}` : '/api/admin/services'
    const method = isEdit ? 'PATCH' : 'POST'
    const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
    if (!res.ok) return alert('Save failed')
    onSaved()
    onClose()
  }

  const field = 'rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#C9A96E] w-full'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A1A1A] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-lg text-white">{isEdit ? 'Edit Service' : 'Add Service'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-white/40">Category</label>
            <select {...register('category')} className={field}>
              <option value="lashes">Lashes</option>
              <option value="brows">Brows</option>
              <option value="pmu">Permanent Makeup</option>
              <option value="addons">Add-ons</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/40">Group label (optional)</label>
            <input {...register('group_label')} placeholder="e.g. Classic" className={field} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/40">Service name</label>
            <input {...register('name')} placeholder="Classic Set" className={field} />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/40">Duration</label>
            <input {...register('duration')} placeholder="2 hrs 30 mins" className={field} />
            {errors.duration && <p className="mt-1 text-xs text-red-400">{errors.duration.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/40">Price</label>
            <input {...register('price')} placeholder="$185" className={field} />
            {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-lg bg-[#C9A96E] py-2.5 text-sm font-semibold text-white transition hover:bg-[#A68B4E] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Service'}
          </button>
        </form>
      </div>
    </div>
  )
}
