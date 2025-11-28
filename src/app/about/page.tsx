'use client'

import { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import { pushAbout, type AboutData } from './services/push-about'
import { useAuthStore } from '@/hooks/use-auth'
import LikeButton from '@/components/like-button'
import GithubSVG from '@/svgs/github.svg'
import initialData from './list.json'

export default function Page() {
<<<<<<< HEAD
	const features = [
		{
			title: '教育经历',
			description: '2008年计科专业毕业，但无码（xue）农（yi）技（bu）能（jing）',
			icon: '✏️'
		},
		{
			title: '工作经历',
			description: '2008~2009/电路板厂：电子工程师（香港明日国际旗下），\n2009~2014/华为OD：需求分析、初级项目经理（中软国际-辗转三地：深圳、南京、武汉），\n2015~2018/操作系统（主营）：文档、社区运营、产品经理（深度科技、统信软件2020-2021二进宫），\n2019~2020/PMS行业（公寓）：产品经理（中国平安旗下），\n2021~至今/操作系统（围绕）：一个会编（AI）码（Code）的商务、产品、运营、测试的项目经理（锂钠氪锶）',
			icon: '🚀'
		}
/*		{
			title: 'UI 编辑',
			description: '文章通过可视化 UI 直接编辑并提交到 Github 仓库',
			icon: '✏️'
		},
		{
			title: '开放协作',
			description: '所有用户都可以编辑，提交需要 Owner 的 Private Key',
			icon: '🔑'
		}
*/
	]

	return (
		<div className='flex flex-col items-center justify-center px-6 pt-32 pb-12'>
			<div className='w-full max-w-[800px]'>
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: INIT_DELAY }} className='mb-12 text-center'>
					<h1 className='mb-4 text-4xl font-bold'>About</h1>
					<p className='text-secondary text-lg'></p>
				</motion.div>
=======
	const [data, setData] = useState<AboutData>(initialData as AboutData)
	const [originalData, setOriginalData] = useState<AboutData>(initialData as AboutData)
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [isPreviewMode, setIsPreviewMode] = useState(false)
	const keyInputRef = useRef<HTMLInputElement>(null)

	const { isAuth, setPrivateKey } = useAuthStore()
	const { content, loading } = useMarkdownRender(data.content)

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
>>>>>>> upstream/main

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
								</div>

								<div className='card relative'>
									<textarea
										placeholder='Markdown 内容'
										className='min-h-[400px] w-full resize-none text-sm'
										value={data.content}
										onChange={e => setData({ ...data, content: e.target.value })}
									/>
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
						</>
					)}

					<div className='mt-8 flex items-center justify-center gap-6'>
						<motion.a
							href='https://github.com/YYsuni/2025-blog-public'
							target='_blank'
							rel='noreferrer'
							initial={{ opacity: 0, scale: 0.6 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0 }}
							className='flex h-[53px] w-[53px] items-center justify-center rounded-full border bg-white/40'>
							<GithubSVG />
						</motion.a>

<<<<<<< HEAD
				<div className='mt-8 flex items-center max-md:flex-col'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: INIT_DELAY + ANIMATION_DELAY * 5 }}
						className='card relative p-6'>
						<h3 className='mb-3 text-xl font-semibold'>个人爱好</h3>
						<div className='flex flex-wrap gap-2'>
							{['慢生活', '象棋', '种菜', '养花', '自驾旅游', '折腾好玩的'].map(tech => (
								<span key={tech} className='text-secondary rounded-lg bg-white/50 px-3 py-1.5 text-sm'>
									{tech}
								</span>
							))}
						</div>
					</motion.div>

					<motion.a
						href='https://github.com/sikenali'
						target='_blank'
						initial={{ opacity: 0, scale: 0.6 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: INIT_DELAY + ANIMATION_DELAY * 6 }}
						className='ml-auto flex h-[53px] w-[53px] items-center justify-center rounded-full border bg-white/40'>
						<GithubSVG />
					</motion.a>

					<LikeButton slug='open-source' className='mx-auto' />
=======
						<LikeButton slug='open-source' delay={0} />
					</div>
>>>>>>> upstream/main
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
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleEnterEditMode}
						className='rounded-xl border bg-white/60 px-6 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80'>
						编辑
					</motion.button>
				)}
			</motion.div>
		</>
	)
}
