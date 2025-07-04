"use client"

import { useAuth } from "@/components/auth-provider"
import { Dashboard } from "@/components/dashboard"
import { LandingPage } from "@/components/landing-page"
import { Loader2 } from "lucide-react"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return user ? <Dashboard /> : <LandingPage />
}
