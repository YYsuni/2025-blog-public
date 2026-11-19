'use client'

import { Fragment } from 'react'
import { useEditorState, type Editor } from '@tiptap/react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import {
	Undo02Icon,
	Redo02Icon,
	Heading01Icon,
	Heading02Icon,
	Heading03Icon,
	Heading04Icon,
	TextBoldIcon,
	TextItalicIcon,
	TextStrikethroughIcon,
	CodeIcon,
	SourceCodeIcon,
	QuoteDownIcon,
	LeftToRightListBulletIcon,
	LeftToRightListNumberIcon,
	MinusSignIcon,
	Link01Icon,
	Table01Icon,
	RowInsertIcon,
	ColumnInsertIcon,
	RowDeleteIcon,
	ColumnDeleteIcon,
	Delete02Icon
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'

export function setLink(editor: Editor) {
	const previous = editor.getAttributes('link').href as string | undefined
	const url = window.prompt('链接 URL', previous || 'https://')
	if (url === null) return

	if (url === '') {
		editor.chain().focus().extendMarkRange('link').unsetLink().run()
		return
	}

	editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

type ToolbarItem = {
	key: string
	label: string
	icon: IconSvgElement
	run: () => void
	active?: boolean
	disabled?: boolean
}

function ToolbarButton({ item }: { item: ToolbarItem }) {
	return (
		<button
			type='button'
			title={item.label}
			aria-label={item.label}
			aria-pressed={item.active}
			disabled={item.disabled}
			// keep editor selection while clicking
			onMouseDown={e => e.preventDefault()}
			onClick={item.run}
			className={cn(
				'flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30',
				item.active && 'bg-brand/10 text-brand'
			)}>
			<HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.8} />
		</button>
	)
}

export function EditorToolbar({ editor }: { editor: Editor | null }) {
	const state = useEditorState({
		editor,
		selector: ({ editor: e }) => ({
			canUndo: !!e?.can().undo(),
			canRedo: !!e?.can().redo(),
			h1: !!e?.isActive('heading', { level: 1 }),
			h2: !!e?.isActive('heading', { level: 2 }),
			h3: !!e?.isActive('heading', { level: 3 }),
			h4: !!e?.isActive('heading', { level: 4 }),
			bold: !!e?.isActive('bold'),
			italic: !!e?.isActive('italic'),
			strike: !!e?.isActive('strike'),
			code: !!e?.isActive('code'),
			codeBlock: !!e?.isActive('codeBlock'),
			blockquote: !!e?.isActive('blockquote'),
			bulletList: !!e?.isActive('bulletList'),
			orderedList: !!e?.isActive('orderedList'),
			link: !!e?.isActive('link'),
			table: !!e?.isActive('table')
		})
	})

	if (!editor || !state) return null

	const chain = () => editor.chain().focus()

	const groups: ToolbarItem[][] = [
		[
			{ key: 'undo', label: '撤销', icon: Undo02Icon, run: () => chain().undo().run(), disabled: !state.canUndo },
			{ key: 'redo', label: '重做', icon: Redo02Icon, run: () => chain().redo().run(), disabled: !state.canRedo }
		],
		[
			{ key: 'h1', label: '标题 1', icon: Heading01Icon, run: () => chain().toggleHeading({ level: 1 }).run(), active: state.h1 },
			{ key: 'h2', label: '标题 2', icon: Heading02Icon, run: () => chain().toggleHeading({ level: 2 }).run(), active: state.h2 },
			{ key: 'h3', label: '标题 3', icon: Heading03Icon, run: () => chain().toggleHeading({ level: 3 }).run(), active: state.h3 },
			{ key: 'h4', label: '标题 4', icon: Heading04Icon, run: () => chain().toggleHeading({ level: 4 }).run(), active: state.h4 }
		],
		[
			{ key: 'bold', label: '加粗', icon: TextBoldIcon, run: () => chain().toggleBold().run(), active: state.bold },
			{ key: 'italic', label: '斜体', icon: TextItalicIcon, run: () => chain().toggleItalic().run(), active: state.italic },
			{ key: 'strike', label: '删除线', icon: TextStrikethroughIcon, run: () => chain().toggleStrike().run(), active: state.strike },
			{ key: 'code', label: '行内代码', icon: CodeIcon, run: () => chain().toggleCode().run(), active: state.code },
			{ key: 'link', label: '链接 (Ctrl+K)', icon: Link01Icon, run: () => setLink(editor), active: state.link }
		],
		[
			{ key: 'bullet', label: '无序列表', icon: LeftToRightListBulletIcon, run: () => chain().toggleBulletList().run(), active: state.bulletList },
			{ key: 'ordered', label: '有序列表', icon: LeftToRightListNumberIcon, run: () => chain().toggleOrderedList().run(), active: state.orderedList },
			{ key: 'quote', label: '引用', icon: QuoteDownIcon, run: () => chain().toggleBlockquote().run(), active: state.blockquote },
			{ key: 'codeBlock', label: '代码块', icon: SourceCodeIcon, run: () => chain().toggleCodeBlock().run(), active: state.codeBlock },
			{ key: 'hr', label: '分割线', icon: MinusSignIcon, run: () => chain().setHorizontalRule().run() }
		],
		[
			{
				key: 'table',
				label: '插入表格',
				icon: Table01Icon,
				run: () => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
				disabled: state.table
			},
			...(state.table
				? [
						{ key: 'row-add', label: '下方加行', icon: RowInsertIcon, run: () => chain().addRowAfter().run() },
						{ key: 'col-add', label: '右侧加列', icon: ColumnInsertIcon, run: () => chain().addColumnAfter().run() },
						{ key: 'row-del', label: '删除行', icon: RowDeleteIcon, run: () => chain().deleteRow().run() },
						{ key: 'col-del', label: '删除列', icon: ColumnDeleteIcon, run: () => chain().deleteColumn().run() },
						{ key: 'table-del', label: '删除表格', icon: Delete02Icon, run: () => chain().deleteTable().run() }
					]
				: [])
		]
	]

	return (
		<div className='mb-3 flex flex-wrap items-center gap-y-1 pb-3'>
			{groups.map((group, i) => (
				<Fragment key={i}>
					{i > 0 && <div className='mx-1.5 h-5 w-px bg-black/10' />}
					{group.map(item => (
						<ToolbarButton key={item.key} item={item} />
					))}
				</Fragment>
			))}
		</div>
	)
}
