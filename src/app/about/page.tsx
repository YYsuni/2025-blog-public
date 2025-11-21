'use client'

import { motion } from 'motion/react'
import { ANIMATION_DELAY, INIT_DELAY } from '@/consts'
import LikeButton from '@/components/like-button'
import GithubSVG from '@/svgs/github.svg'

export default function Page() {
	const features = [
		{
			title: '教育经历',
			description: '2008年计科专业毕业，但无码（xue）农（yi）技（bu）能（jing）',
			icon: '📦'
		},
		{
			title: '工作经历',
			description: 
			'2008~2009/电路板厂：电子工程师（香港明日国际旗下）
             2009~2014/华为OD：需求分析、初级项目经理（中软国际-辗转三地：深圳、南京、武汉）
             2015~2018/操作系统（主营）：文档、社区运营、产品经理（深度科技、统信软件2020-2021二进宫）
             2019~2020/PMS行业（公寓）：产品经理（中国平安旗下）
             2021~至今/操作系统（围绕）：一个会编（AI）码（Code）的商务、产品、运营、测试的项目经理（锂钠氪锶）
			 ',
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

				<div className='grid gap-6 md:grid-cols-2'>
					{features.map((feature, index) => (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: INIT_DELAY + ANIMATION_DELAY * (index + 1) }}
							className='card relative flex flex-col gap-3 p-6'>
							<div className='text-3xl'>{feature.icon}</div>
							<h3 className='text-xl font-semibold'>{feature.title}</h3>
							<p className='text-secondary leading-relaxed'>{feature.description}</p>
						</motion.div>
					))}
				</div>

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
				</div>
			</div>
		</div>
	)
}
