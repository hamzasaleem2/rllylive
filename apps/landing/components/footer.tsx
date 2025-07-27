import { Logo } from "./logo"

export function Footer() {
  return (
    <footer className="border-t border-border/20 flex-shrink-0">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-xs text-muted-foreground">
            <Logo />
            <span className="hidden sm:inline opacity-60">Real-time events, really simple</span>
          </div>
          
          <div className="flex items-center space-x-6 text-xs">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Privacy</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Terms</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Support</a>
            <span className="text-muted-foreground/50 font-mono">© 2025</span>
          </div>
        </div>
      </div>
    </footer>
  )
}