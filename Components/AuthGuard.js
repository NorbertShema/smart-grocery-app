'use client'
import { useEffect, useState } from 'react'
import { Box, Button, Typography, CircularProgress, Paper, Container } from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import { supabase } from '@/lib/supabaseClient'

export default function AuthGuard({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = () => supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  })

  const signOut = () => supabase.auth.signOut()

  if (user === undefined) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress color="primary" />
    </Box>
  )

  if (!user) return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" gap={3}>
        <Typography variant="h4" fontWeight={700} color="primary">🛒 Smart Grocery</Typography>
        <Typography color="text.secondary">Plan meals. Build lists. Stay on budget.</Typography>
        <Paper sx={{ p: 4, borderRadius: 3, width: '100%', textAlign: 'center' }}>
          <Typography variant="h6" mb={3}>Sign in to get started</Typography>
          <Button variant="contained" size="large" startIcon={<GoogleIcon />} onClick={signIn} fullWidth>
            Continue with Google
          </Button>
        </Paper>
      </Box>
    </Container>
  )

  return (
    <Box>
      <Box sx={{ position: 'absolute', top: 16, right: 24 }}>
        <Typography variant="caption" color="text.secondary" mr={1}>{user.email}</Typography>
        <Button size="small" onClick={signOut} color="inherit">Sign out</Button>
      </Box>
      {children}
    </Box>
  )
}