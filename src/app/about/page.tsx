'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import { pushAbout, type AboutData } from './services/push-about'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import LikeButton from '@/components/like-button'
import GithubSVG from '@/svgs/github.svg'
import initialData from './list.json'

export default function Page() {
	const [data, setData] = useState<AboutData>(initialData as AboutData)
	const [originalData, setOriginalData] = useState<AboutData>(initialData as AboutData)
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [isPreviewMode, setIsPreviewMode] = useState(false)
	const keyInputRef = useRef<HTMLInputElement>(null)

	const { isAuth, setPrivateKey } = useAuthStore()
	const { siteContent } = useConfigStore()
	const { content, loading } = useMarkdownRender(data.content)
	const hideEditButton = siteContent.hideEditButton ?? false

	const handleChoosePrivateKey = async (file: File) => {
		try {
			const text = await file.text()
			setPrivateKey(text)
			await handleSave()
		} catch (error) {
			console.error('Failed to read private key:', error)
			toast.error('读取密钥文件失败')
		}
	}

	const handleSaveClick = () => {
		if (!isAuth) {
			keyInputRef.current?.click()
		} else {
			handleSave()
		}
	}

	const handleEnterEditMode = () => {
		setIsEditMode(true)
		setIsPreviewMode(false)
	}

	const handleSave = async () => {
		setIsSaving(true)

		try {
			await pushAbout(data)

			setOriginalData(data)
			setIsEditMode(false)
			setIsPreviewMode(false)
			toast.success('保存成功！')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setData(originalData)
		setIsEditMode(false)
		setIsPreviewMode(false)
	}

	const buttonText = isAuth ? '保存' : '导入密钥'

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditMode && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				setIsEditMode(true)
				setIsPreviewMode(false)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isEditMode])

	return (
		<>
			<input
				ref={keyInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async e => {
					const f = e.target.files?.[0]
					if (f) await handleChoosePrivateKey(f)
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>

			<div className='flex flex-col items-center justify-center px-6 pt-32 pb-12 max-sm:px-0'>
				<div className='w-full max-w-[800px]'>
					{isEditMode ? (
						isPreviewMode ? (
							<div className='space-y-6'>
								<div className='text-center'>
									<h1 className='mb-4 text-4xl font-bold'>{data.title || '标题预览'}</h1>
									<p className='text-secondary text-lg'>{data.description || '描述预览'}</p>
								</div>

								{loading ? (
									<div className='text-secondary text-center'>预览渲染中...</div>
								) : (
									<div className='card relative p-6'>
										<div className='prose prose-sm max-w-none'>{content}</div>
									</div>
								)}

								{data.skills && data.skills.length > 0 && (
									<div className='mt-12'>
										<h2 className='mb-6 text-center text-2xl font-bold'>技能标签</h2>
										<div className='flex flex-wrap items-center justify-center -m-3'>
											{data.skills.map(skill => (
												<div
													key={skill.name}
													className='m-3 rounded-full border px-6 py-3 text-sm font-medium shadow-sm'
													style={{
														borderColor: skill.color + '40',
														color: skill.color,
														backgroundColor: skill.color + '08'
													}}>
													{skill.name}
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						) : (
							<div className='space-y-6'>
								<div className='space-y-4'>
									<input
										type='text'
										placeholder='标题'
										className='w-full px-4 py-3 text-center text-2xl font-bold'
										value={data.title}
										onChange={e => setData({ ...data, title: e.target.value })}
									/>
									<input
										type='text'
										placeholder='描述'
										className='w-full px-4 py-3 text-center text-lg'
										value={data.description}
										onChange={e => setData({ ...data, description: e.target.value })}
									/>
									<input
										type='url'
										placeholder='GitHub 链接'
										className='w-full px-4 py-3 text-center text-sm'
										value={data.githubUrl || ''}
										onChange={e => setData({ ...data, githubUrl: e.target.value })}
									/>
								</div>

								<div className='card relative'>
									<textarea
										placeholder='Markdown 内容'
										className='min-h-[400px] w-full resize-none text-sm'
										value={data.content}
										onChange={e => setData({ ...data, content: e.target.value })}
									/>
								</div>

								<div className='card relative p-6'>
									<h3 className='mb-4 text-lg font-bold'>技能标签</h3>
									<div className='mb-4 space-y-3'>
										{data.skills?.map((skill, index) => (
											<div key={index} className='flex items-center gap-3'>
												<input
													type='text'
													placeholder='技能名称'
													className='flex-1 px-3 py-2 text-sm'
													value={skill.name}
													onChange={e => {
														const newSkills = [...(data.skills || [])]
														newSkills[index] = { ...skill, name: e.target.value }
														setData({ ...data, skills: newSkills })
													}}
												/>
												<input
													type='color'
													className='h-10 w-20 cursor-pointer rounded border'
													value={skill.color}
													onChange={e => {
														const newSkills = [...(data.skills || [])]
														newSkills[index] = { ...skill, color: e.target.value }
														setData({ ...data, skills: newSkills })
													}}
												/>
												<button
													onClick={() => {
														const newSkills = data.skills?.filter((_, i) => i !== index)
														setData({ ...data, skills: newSkills })
													}}
													className='rounded-lg border bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100'>
													删除
												</button>
											</div>
										))}
									</div>
									<button
										onClick={() => {
											const newSkills = [...(data.skills || []), { name: '', color: '#3178C6' }]
											setData({ ...data, skills: newSkills })
										}}
										className='w-full rounded-lg border border-dashed px-4 py-2 text-sm hover:bg-gray-50'>
										+ 添加技能标签
									</button>
								</div>
							</div>
						)
					) : (
						<>
							<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='mb-12 text-center'>
								<h1 className='mb-4 text-4xl font-bold'>{data.title}</h1>
								<p className='text-secondary text-lg'>{data.description}</p>
							</motion.div>

							{loading ? (
								<div className='text-secondary text-center'>加载中...</div>
							) : (
								<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className='card relative p-6'>
									<div className='prose prose-sm max-w-none'>{content}</div>
								</motion.div>
							)}

							{data.skills && data.skills.length > 0 && (
								<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className='mt-12'>
									<h2 className='mb-6 text-center text-2xl font-bold'>技能标签</h2>
									<div className='flex flex-wrap items-center justify-center -m-3'>
										{data.skills.map((skill, index) => (
											<motion.div
												key={skill.name}
												initial={{ opacity: 0, scale: 0 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ delay: 0.3 + index * 0.05 }}
												whileHover={{ scale: 1.1, y: -2 }}
												className='m-3 rounded-full border px-6 py-3 text-sm font-medium shadow-sm transition-all hover:shadow-md'
												style={{
													borderColor: skill.color + '40',
													color: skill.color,
													backgroundColor: skill.color + '08'
												}}>
												{skill.name}
											</motion.div>
										))}
									</div>
								</motion.div>
							)}
						</>
					)}

					<div className='mt-8 flex items-center justify-center gap-6'>
						<motion.a
							href={data.githubUrl || 'https://github.com'}
							target='_blank'
							rel='noreferrer'
							initial={{ opacity: 0, scale: 0.6 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0 }}
							className='bg-card flex h-[53px] w-[53px] items-center justify-center rounded-full border'>
							<GithubSVG />
						</motion.a>

						<LikeButton slug='open-source' delay={0} />
					</div>
				</div>
			</div>

			<motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className='fixed top-4 right-6 z-10 flex gap-3 max-sm:hidden'>
				{isEditMode ? (
					<>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleCancel}
							disabled={isSaving}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							取消
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setIsPreviewMode(prev => !prev)}
							disabled={isSaving}
							className={`rounded-xl border bg-white/60 px-6 py-2 text-sm`}>
							{isPreviewMode ? '继续编辑' : '预览'}
						</motion.button>
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSaveClick} disabled={isSaving} className='brand-btn px-6'>
							{isSaving ? '保存中...' : buttonText}
						</motion.button>
					</>
				) : (
					!hideEditButton && (
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleEnterEditMode}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80'>
							编辑
						</motion.button>
					)
				)}
			</motion.div>
		</>
	)
}
