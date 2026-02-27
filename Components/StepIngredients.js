'use client'
import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Autocomplete, TextField,
  List, ListItem, ListItemText, IconButton, Chip, CircularProgress
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

const COMMON = ['Butter', 'Salt', 'Pepper', 'Olive Oil', 'Garlic', 'Onion', 'Eggs', 'Milk', 'Flour', 'Sugar']

export default function StepIngredients({ recipe, ingredients, setIngredients, onBack, onNext }) {
  const [loading, setLoading] = useState(false)
  const [custom, setCustom] = useState(null)

  useEffect(() => {
    if (!recipe?.id || ingredients.length > 0) return
    setLoading(true)
    fetch(`/api/recipe-ingredients?id=${recipe.id}`)
      .then(r => r.json())
      .then(data => setIngredients(data.ingredients || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [recipe])

  const add = (name) => {
    if (!name || ingredients.find(i => i.name?.toLowerCase() === name.toLowerCase())) return
    setIngredients(prev => [...prev, { name, amount: 1, unit: 'unit', price: 0 }])
    setCustom(null)
  }

  const remove = (name) => setIngredients(prev => prev.filter(i => i.name !== name))

  // Merge duplicate ingredients by name
  const merged = ingredients.reduce((acc, ing) => {
    const key = ing.name?.toLowerCase()
    const existing = acc.find(i => i.name?.toLowerCase() === key)
    if (existing) existing.amount += ing.amount
    else acc.push({ ...ing })
    return acc
  }, [])

  return (
    <Box>
      <Typography variant="h6" mb={1}>Review Ingredients</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        From: <strong>{recipe?.title}</strong>
      </Typography>

      {loading ? (
        <Box textAlign="center" py={4}><CircularProgress /></Box>
      ) : (
        <List dense sx={{ mb: 2, maxHeight: 300, overflowY: 'auto' }}>
          {merged.map(ing => (
            <ListItem
              key={ing.name}
              secondaryAction={
                <IconButton edge="end" size="small" onClick={() => remove(ing.name)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
              sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <ListItemText
                primary={ing.name}
                secondary={`${ing.amount} ${ing.unit}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      <Box display="flex" gap={1} mb={3}>
        <Autocomplete
          freeSolo
          options={COMMON}
          value={custom}
          onChange={(_, v) => setCustom(v)}
          onInputChange={(_, v) => setCustom(v)}
          renderInput={p => <TextField {...p} size="small" placeholder="Add ingredient manually..." />}
          sx={{ flex: 1 }}
        />
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => add(custom)}>Add</Button>
      </Box>

      <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
        {COMMON.map(c => (
          <Chip key={c} label={c} size="small" onClick={() => add(c)} variant="outlined" />
        ))}
      </Box>

      <Box display="flex" justifyContent="space-between">
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={() => onNext(merged)} disabled={merged.length === 0}>
          Build Shopping List →
        </Button>
      </Box>
    </Box>
  )
}