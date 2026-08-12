import Link from 'next/link'

export default function Page() {
 return (
  <main className="flex min-h-screen items-center justify-center bg-background px-5 text-center">
   <Link className="text-sm text-foreground underline" href="/it">
    Continue to Crooked House
   </Link>
  </main>
 )
}
