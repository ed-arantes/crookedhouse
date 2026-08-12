export default function NotFound() {
 return (
  <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center">
   <div>
    <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
     404
    </p>
    <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
     Page not found
    </h1>
    <p className="mt-3 text-sm text-muted-foreground">
     The page you were looking for does not exist.
    </p>
   </div>
  </main>
 )
}
