import { motion } from 'motion/react'
import { useWriteStore } from '../../stores/write-store'
import { TagInput } from '../ui/tag-input'
import { Switch } from '@/components/ui/switch'

type MetaSectionProps = {
	delay?: number
}

export function MetaSection({ delay = 0 }: MetaSectionProps) {
	const { form, updateForm } = useWriteStore()
	return (
		<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }} className='card relative'>
			<h2 className='text-sm'>元信息</h2>

			<div className='mt-3 space-y-2'>
				<textarea
					placeholder='为这篇文章写一段简短摘要'
					rows={2}
					className='bg-card block w-full resize-none rounded-xl border p-3 text-sm'
					value={form.summary}
					onChange={e => updateForm({ summary: e.target.value })}
				/>

				<TagInput tags={form.tags} onChange={tags => updateForm({ tags })} />
				<input
					type='date'
					placeholder='日期'
					className='bg-card w-full rounded-lg border px-3 py-2 text-sm'
					value={form.date}
					onChange={e => updateForm({ date: e.target.value })}
				/>
				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						id="hidden-check"
						checked={form.hidden || false}
						onChange={(e) => updateForm({ hidden: e.target.checked })}
						className="h-4 w-4 rounded border-gray-300"
					/>
					<label htmlFor="hidden-check" className="text-sm text-gray-600 select-none cursor-pointer">
						隐藏此文章（仅管理员可见）
					</label>
				</div>
			</div>
		</motion.div>
	)
}
