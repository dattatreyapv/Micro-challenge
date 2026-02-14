'use client'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={login}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Sign in with Google
      </button>
    </div>
  )
}
