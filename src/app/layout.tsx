import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '간병인 서류 자동 발급 시스템',
  description: '영수증 이미지를 업로드하고 즉시 간병 서류 3종을 발급받으세요.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col antialiased selection:bg-primary/30 selection:text-primary-foreground`}>
        <header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
            <div className="flex items-center gap-3">
              <div className="relative inline-flex items-center h-[120px] md:h-[100px] drop-shadow-sm transition-transform hover:scale-105">
                <img src="/logo.png" alt="로고" className="h-full w-auto object-contain opacity-0" crossOrigin="anonymous" />
                <div className="absolute inset-0 bg-[#38bdf8] md:bg-[#1A93D2]" style={{ WebkitMask: 'url(/logo.png) no-repeat center / contain', mask: 'url(/logo.png) no-repeat center / contain' }} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground hidden sm:block">
                <a href="/" className="hover:text-primary transition-colors duration-200">간병인 서류 자동 발급 시스템</a>
              </h1>
            </div>
            <nav className="flex flex-row items-center space-x-6">
              <a href="/history" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">📄 발급 이력</a>
              <a href="/settings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">⚙️ 설정</a>
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground font-mono font-medium hidden sm:inline-block">v1.1.0</span>
            </nav>
          </div>
        </header>

        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </main>

        <footer className="border-t border-border/50 bg-card mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-8 md:py-10 text-center flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              &copy; {new Date().getFullYear()} 간병인 서류 발급 시스템.
            </span>
            <span className="text-xs text-muted-foreground/60">
              Designed for Cloud9. All rights reserved.
            </span>
          </div>
        </footer>
      </body>
    </html>
  )
}
