'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'

type UseEditPageOptions = {
	/** Ctrl/Cmd+, enters edit mode (default true) */
	enableShortcut?: boolean
	onEnterEdit?: () => void
}

/**
 * Shared edit-mode + private-key picker for list CMS pages.
 */
export function useEditPage(options: UseEditPageOptions = {}) {
	const { enableShortcut = true, onEnterEdit } = options
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const keyInputRef = useRef<HTMLInputElement>(null)
	const pendingSaveRef = useRef<(() => Promise<void>) | null>(null)

	const { isAuth, setPrivateKey } = useAuthStore()
	const hideEditButton = useConfigStore(s => s.siteContent.hideEditButton ?? false)

	const enterEditMode = useCallback(() => {
		setIsEditMode(true)
		onEnterEdit?.()
	}, [onEnterEdit])

	useEffect(() => {
		if (!enableShortcut) return

		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditMode && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				enterEditMode()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isEditMode, enableShortcut, enterEditMode])

	const runSave = useCallback(async (save: () => Promise<void>) => {
		setIsSaving(true)
		try {
			await save()
			setIsEditMode(false)
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}, [])

	const handleSaveClick = useCallback(
		(save: () => Promise<void>) => {
			pendingSaveRef.current = save
			if (!isAuth) {
				keyInputRef.current?.click()
			} else {
				void runSave(save)
			}
		},
		[isAuth, runSave]
	)

	const handlePemChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0]
			const save = pendingSaveRef.current
			if (file && save) {
				try {
					const text = await file.text()
					await setPrivateKey(text)
					await runSave(save)
				} catch (error) {
					console.error('Failed to read private key:', error)
					toast.error('读取密钥文件失败')
				}
			}
			if (e.currentTarget) e.currentTarget.value = ''
		},
		[setPrivateKey, runSave]
	)

	return {
		isEditMode,
		setIsEditMode,
		enterEditMode,
		isSaving,
		isAuth,
		hideEditButton,
		keyInputRef,
		buttonText: isAuth ? '保存' : '导入密钥',
		handleSaveClick,
		handlePemChange,
		runSave
	}
}
