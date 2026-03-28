import Layout from '@/layout'

export default function MainLayout({
	children
}: Readonly<{ children: React.ReactNode }>) {
	return <Layout>{children}</Layout>
}
