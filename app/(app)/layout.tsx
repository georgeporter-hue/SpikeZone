import { BottomNav } from '@/components/bottom-nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-[oklch(0.11_0.008_260)]">
      {/* Mobile app frame */}
      <div className="relative flex min-h-dvh w-full max-w-md flex-col overflow-hidden bg-background shadow-2xl md:my-4 md:min-h-[calc(100dvh-2rem)] md:rounded-[2.5rem] md:border md:border-border">
        <main className="no-scrollbar flex-1 overflow-y-auto pb-24">{children}</main>
        <BottomNav />
      </div>
    </div>
  )
}
