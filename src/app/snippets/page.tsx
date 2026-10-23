'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { DialogModal } from '@/components/dialog-modal'
import initialList from './list.json'
import { pushSnippets } from './services/push-snippets'
import { useEditPage } from '@/hooks/use-edit-page'
import { EditToolbar, EditToolbarActionButton } from '@/components/edit-toolbar'

const getRandomSnippet = (list: string[]) => (list.length === 0 ? '' : list[Math.floor(Math.random() * list.length)])

export default function Page() {
	const [snippets, setSnippets] = useState<string[]>(initialList as string[])
	const [originalSnippets, setOriginalSnippets] = useState<string[]>(initialList as string[])
	const [currentSnippet] = useState<string>(getRandomSnippet(initialList as string[]))
	const [isManageOpen, setIsManageOpen] = useState(false)
	const [draftSnippets, setDraftSnippets] = useState<string[]>([])
	const [newSnippet, setNewSnippet] = useState('')

	const { isEditMode, setIsEditMode, enterEditMode, isSaving, hideEditButton, keyInputRef, buttonText, handleSaveClick, handlePemChange } =
		useEditPage()

	const persist = async () => {
		await pushSnippets({ snippets })
		setOriginalSnippets(snippets)
	}

	const handleCancel = () => {
		setSnippets(originalSnippets)
		setIsEditMode(false)
	}

	const openManageDialog = () => {
		setDraftSnippets(snippets)
		setNewSnippet('')
		setIsManageOpen(true)
	}

	const handleAddDraft = () => {
		const value = newSnippet.trim()
		if (!value) {
			toast.error('请输入句子')
			return
		}
		setDraftSnippets(prev => [...prev, value])
		setNewSnippet('')
	}

	const handleRemoveDraft = (index: number) => {
		setDraftSnippets(prev => prev.filter((_, i) => i !== index))
	}

	const applyManageChanges = () => {
		const cleaned = draftSnippets.map(item => item.trim()).filter(Boolean)
		if (cleaned.length === 0) {
			toast.error('请至少添加一句话')
			return
		}
		setSnippets(cleaned)
		setIsManageOpen(false)
		toast.success('已更新列表')
	}

	const cancelManageChanges = () => {
		setIsManageOpen(false)
		setDraftSnippets([])
		setNewSnippet('')
	}

	return (
		<>
			<input ref={keyInputRef} type='file' accept='.pem' className='hidden' onChange={handlePemChange} />

			<div className='flex min-h-[70vh] flex-col items-center justify-center px-6 py-24'>
				<div className='w-full max-w-3xl text-center'>
					<p className='text-2xl leading-relaxed font-semibold'>{currentSnippet || '无'}</p>
				</div>
			</div>

			<EditToolbar
				isEditMode={isEditMode}
				isSaving={isSaving}
				hideEditButton={hideEditButton}
				buttonText={buttonText}
				onEdit={enterEditMode}
				onCancel={handleCancel}
				onSave={() => handleSaveClick(persist)}
				extraEditActions={<EditToolbarActionButton onClick={openManageDialog} label='管理' />}
			/>

			<DialogModal open={isManageOpen} onClose={cancelManageChanges} className='card static w-[520px] max-sm:w-full'>
				<div className='space-y-4'>
					<div className='flex items-center gap-3'>
						<input
							type='text'
							value={newSnippet}
							onChange={e => setNewSnippet(e.target.value)}
							placeholder='新增'
							className='flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none'
						/>
						<button onClick={handleAddDraft} className='brand-btn flex items-center gap-1 px-4 py-2 text-sm'>
							<Plus className='h-4 w-4' />
							新增
						</button>
					</div>

					<div className='max-h-[320px] space-y-2 overflow-y-auto pr-1'>
						{draftSnippets.length === 0 && <p className='text-secondary py-6 text-center text-sm'>暂无内容</p>}
						{draftSnippets.map((item, index) => (
							<div key={`${item}-${index}`} className='group flex items-start gap-3 rounded-lg px-3 py-2 text-sm'>
								<p className='flex-1 leading-relaxed text-gray-800'>{item}</p>
								<button onClick={() => handleRemoveDraft(index)} className='text-gray-400 transition-colors hover:text-red-500'>
									<X className='h-4 w-4' />
								</button>
							</div>
						))}
					</div>

					<div className='mt-4 flex gap-3'>
						<button
							onClick={cancelManageChanges}
							className='flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm transition-colors hover:bg-gray-50'>
							取消
						</button>
						<button onClick={applyManageChanges} className='brand-btn flex-1 justify-center px-4'>
							保存
						</button>
					</div>
				</div>
			</DialogModal>
		</>
	)
}
