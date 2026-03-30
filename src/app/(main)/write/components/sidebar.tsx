import { CoverSection } from './sections/cover-section'
import { MetaSection } from './sections/meta-section'
import { ImagesSection } from './sections/images-section'
import { ANIMATION_DELAY, INIT_DELAY } from '@/consts'

export function WriteSidebar() {
	return (
		<div className='w-[320px] space-y-6'>
			<CoverSection delay={INIT_DELAY + ANIMATION_DELAY * 0} />
			<MetaSection delay={INIT_DELAY + ANIMATION_DELAY * 1} />
			<ImagesSection delay={INIT_DELAY + ANIMATION_DELAY * 2} />
		</div>
	)
}
