import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
      <span className="font-mono text-sm tracking-wider font-medium">rlly</span>
      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full ml-1.5"></div>
    </Link>
  )
}