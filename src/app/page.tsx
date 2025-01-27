import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-500 to-purple-600 text-white">
      <header className="container mx-auto px-4 py-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Lovli</h1>
        <nav>
          <Button asChild variant="ghost" className="text-white hover:text-pink-200 mr-4">
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold mb-6">Find Your Perfect Match</h2>
        <p className="text-xl mb-8">Join millions of singles in their journey to meaningful connections.</p>
        <Button asChild size="lg" className="bg-white text-pink-600 hover:bg-pink-100">
          <Link href="/auth/signup">Get Started</Link>
        </Button>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white/10 backdrop-blur-lg text-white">
            <CardContent className="p-6">
              <h3 className="text-2xl font-semibold mb-4">Smart Matching</h3>
              <p>Our AI-powered algorithm finds your most compatible matches.</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-lg text-white">
            <CardContent className="p-6">
              <h3 className="text-2xl font-semibold mb-4">Safe & Secure</h3>
              <p>Your privacy and safety are our top priorities.</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-lg text-white">
            <CardContent className="p-6">
              <h3 className="text-2xl font-semibold mb-4">Premium Features</h3>
              <p>Unlock advanced features to boost your dating experience.</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center">
        <p>&copy; 2024 Lovli. All rights reserved.</p>
      </footer>
    </div>
  )
}