'use client'

import { useState } from 'react'
import GridView, { type Blogger } from './grid-view'
import CreateDialog from './components/create-dialog'
import { pushBloggers } from './services/push-bloggers'
import initialList from './list.json'
import type { AvatarItem } from './components/avatar-upload-dialog'
import { useEditPage } from '@/hooks/use-edit-page'
import { EditToolbar, EditToolbarAddButton } from '@/components/edit-toolbar'

export default function Page() {
	const [bloggers, setBloggers] = useState<Blogger[]>(initialList as Blogger[])
	const [originalBloggers, setOriginalBloggers] = useState<Blogger[]>(initialList as Blogger[])
	const [editingBlogger, setEditingBlogger] = useState<Blogger | null>(null)
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [avatarItems, setAvatarItems] = useState<Map<string, AvatarItem>>(new Map())

	const { isEditMode, setIsEditMode, enterEditMode, isSaving, hideEditButton, keyInputRef, buttonText, handleSaveClick, handlePemChange } =
		useEditPage()

	const handleUpdate = (updatedBlogger: Blogger, oldBlogger: Blogger, avatarItem?: AvatarItem) => {
		setBloggers(prev => prev.map(b => (b.url === oldBlogger.url ? updatedBlogger : b)))
		if (avatarItem) {
			setAvatarItems(prev => {
				const newMap = new Map(prev)
				newMap.set(updatedBlogger.url, avatarItem)
				return newMap
			})
		}
	}

	const handleAdd = () => {
		setEditingBlogger(null)
		setIsCreateDialogOpen(true)
	}

	const handleSaveBlogger = (updatedBlogger: Blogger, avatarItem?: AvatarItem) => {
		if (editingBlogger) {
			setBloggers(bloggers.map(b => (b.url === editingBlogger.url ? updatedBlogger : b)))
		} else {
			setBloggers([...bloggers, updatedBlogger])
		}
		if (avatarItem) {
			setAvatarItems(prev => {
				const newMap = new Map(prev)
				newMap.set(updatedBlogger.url, avatarItem)
				return newMap
			})
		}
	}

	const handleDelete = (blogger: Blogger) => {
		if (confirm(`确定要删除 ${blogger.name} 吗？`)) {
			setBloggers(bloggers.filter(b => b.url !== blogger.url))
		}
	}

	const persist = async () => {
		const updatedBloggers = await pushBloggers({ bloggers, avatarItems })
		setBloggers(updatedBloggers)
		setOriginalBloggers(updatedBloggers)
		setAvatarItems(new Map())
	}

	const handleCancel = () => {
		setBloggers(originalBloggers)
		setAvatarItems(new Map())
		setIsEditMode(false)
	}

	return (
		<>
			<input ref={keyInputRef} type='file' accept='.pem' className='hidden' onChange={handlePemChange} />

			<GridView bloggers={bloggers} isEditMode={isEditMode} onUpdate={handleUpdate} onDelete={handleDelete} />

			<EditToolbar
				isEditMode={isEditMode}
				isSaving={isSaving}
				hideEditButton={hideEditButton}
				buttonText={buttonText}
				onEdit={enterEditMode}
				onCancel={handleCancel}
				onSave={() => handleSaveClick(persist)}
				extraEditActions={<EditToolbarAddButton onClick={handleAdd} />}
			/>

			{isCreateDialogOpen && <CreateDialog blogger={editingBlogger} onClose={() => setIsCreateDialogOpen(false)} onSave={handleSaveBlogger} />}
		</>
	)
}
