export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Distiller.
          </p>
          <div className="flex items-center gap-3">
            <a href="https://x.com/attafii" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground">Twitter</a>
            <a href="https://github.com/ahmedattafi" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground">GitHub</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/RefinedFeed" className="text-xs text-muted-foreground hover:text-foreground">Feed</a>
          <a href="/about" className="text-xs text-muted-foreground hover:text-foreground">About</a>
          <a href="/pricing" className="text-xs text-muted-foreground hover:text-foreground">Pricing</a>
          <a href="/mena" className="text-xs text-muted-foreground hover:text-foreground">MENA</a>
          <a href="/feed.xml" className="text-xs text-muted-foreground hover:text-foreground">RSS</a>
          <a href="/terms" className="text-xs text-muted-foreground hover:text-foreground">Terms</a>
          <a href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">Privacy</a>
          <a href="/auth/login" className="text-xs text-muted-foreground hover:text-foreground">Sign in</a>
        </div>
      </div>
    </footer>
  );
}