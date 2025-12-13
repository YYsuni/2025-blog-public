export default function StarRating({ stars }: { stars: number }) {
	return (
		<div className='flex items-center gap-0.5'>
			{[1, 2, 3, 4, 5].map(index => (
				<StarIcon key={index} filled={index <= stars} />
			))}
		</div>
	)
}

function StarIcon({ filled }: { filled: boolean }) {
	return (
		<svg width='16' height='16' viewBox='0 0 24 24' className={filled ? 'fill-yellow-400' : 'fill-gray-300'}>
			<path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
		</svg>
	)
}
