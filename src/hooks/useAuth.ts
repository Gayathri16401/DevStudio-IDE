import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('useAuth effect running')
    console.log('Supabase client exists:', !!supabase)
    
    const initAuth = async () => {
      try {
        console.log('initializing auth')
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
        console.log('Has Supabase Key:', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          console.log('got session:', !!session, session)
          setSession(session)
          setUser(session?.user ?? null)
        }
        setLoading(false)
      } catch (error) {
        console.error('Error in initAuth:', error)
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log('auth state changed:', _event, !!session)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Error setting up auth listener:', error)
      setLoading(false)
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      console.log('attempting sign up')
      const { error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) throw error
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('attempting sign in')
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log('attempting sign out')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }
}