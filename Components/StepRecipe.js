'use client'
import { useState } from 'react'
import {
  Box, TextField, Button, Grid, Card, CardContent, CardMedia,
  CardActionArea, Typography, CircularProgress, Chip, Alert
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { supabase } from '@/lib/supabaseClient'

export default function StepRecipe({ onSelect }) {
  const [query, setQuery] = useState('')
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true); setError(null)

    try {
      // 1. Check Supabase cache first
      const { data: cached } = await supabase
        .from('recipes_cache')
        .select('*')
        .ilike('title', `%${query}%`)
        .limit(9)

      if (cached?.length > 0) {
        setRecipes(cached); setLoading(false); return
      }

      // 2. Hit Spoonacular if no cache
      const res = await fetch(`/api/recipes?query=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('API limit reached or unavailable')
      const data = await res.json()
      setRecipes(data.results || [])

      // 3. Cache results in Supabase
      if (data.results?.length > 0) {
        await supabase.from('recipes_cache').upsert(
          data.results.map(r => ({
            id: r.id, title: r.title, image: r.image,
            summary: r.summary || '', cached_at: new Date().toISOString()
          }))
        )
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h6" mb={2}>Search for a Recipe</Typography>
      <Box display="flex" gap={1} mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="e.g. pasta, chicken stir fry, tacos..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          size="small"
        />
        <Button variant="contained" onClick={search} startIcon={<SearchIcon />} disabled={loading}>
          Search
        </Button>
      </Box>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error} — showing cached results if available.</Alert>}
      {loading && <Box textAlign="center" py={4}><CircularProgress /></Box>}

      <Grid container spacing={2}>
        {recipes.map(r => (
          <Grid item xs={12} sm={6} md={4} key={r.id}>
            <Card sx={{ height: '100%', '&:hover': { borderColor: 'primary.main', borderWidth: 1, borderStyle: 'solid' } }}>
              <CardActionArea onClick={() => onSelect(r)} sx={{ height: '100%' }}>
                {r.image && <CardMedia component="img" height="140" image={r.image} alt={r.title} />}
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600}>{r.title}</Typography>
                  <Chip label="Select Recipe" size="small" color="primary" sx={{ mt: 1 }} />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}