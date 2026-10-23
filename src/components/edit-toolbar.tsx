'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

type EditToolbarProps = {
	isEditMode: boolean
	isSaving: boolean
	hideEditButton: boolean
	buttonText: string
	onEdit: () => void
	onCancel: () => void
	onSave: () => void
	/** Shown before 取消 in edit mode */
	leadingEditActions?: React.ReactNode
	/** Shown after 取消, before 保存 in edit mode */
	extraEditActions?: React.ReactNode
	className?: string
	editButtonClassName?: string
}

export function EditToolbar({
	isEditMode,
	isSaving,
	hideEditButton,
	buttonText,
	onEdit,
	onCancel,
	onSave,
	leadingEditActions,
	extraEditActions,
	className,
	editButtonClassName
}: EditToolbarProps) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.6 }}
			animate={{ opacity: 1, scale: 1 }}
			className={cn('absolute top-4 right-6 flex gap-3 max-sm:hidden', className)}>
			{isEditMode ? (
				<>
					{leadingEditActions}
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={onCancel}
						disabled={isSaving}
						className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
						取消
					</motion.button>
					{extraEditActions}
					<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onSave} disabled={isSaving} className='brand-btn px-6'>
						{isSaving ? '保存中...' : buttonText}
					</motion.button>
				</>
			) : (
				!hideEditButton && (
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={onEdit}
						className={cn(
							'bg-card rounded-xl border px-6 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80',
							editButtonClassName
						)}>
						编辑
					</motion.button>
				)
			)}
		</motion.div>
	)
}

export function EditToolbarActionButton({
	onClick,
	label,
	disabled,
	className
}: {
	onClick: () => void
	label: string
	disabled?: boolean
	className?: string
}) {
	return (
		<motion.button
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			onClick={onClick}
			disabled={disabled}
			className={cn('rounded-xl border bg-white/60 px-6 py-2 text-sm', className)}>
			{label}
		</motion.button>
	)
}

/** @deprecated use EditToolbarActionButton */
export function EditToolbarAddButton({ onClick, label = '添加' }: { onClick: () => void; label?: string }) {
	return <EditToolbarActionButton onClick={onClick} label={label} />
}
