'use client'
import { useState } from 'react'
import {
  Box, Typography, Button, List, ListItem, ListItemText,
  Checkbox, Chip, Alert, Snackbar, IconButton, Tooltip
} from '@mui/material'
import ShareIcon from '@mui/icons-material/Share'
import { supabase } from '@/lib/supabaseClient'
import { v4 as uuid } from 'uuid'

export default function StepShoppingList({ ingredients, onBack, onNext }) {
  const [checked, setChecked] = useState([])
  const [saving, setSaving] = useState(false)
  const [shareUrl, setShareUrl] = useState(null)
  const [snackbar, setSnackbar] = useState(false)

  const toggle = (name) =>
    setChecked(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])

  const saveAndContinue = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const shareToken = uuid()
    const tripName = `Trip — ${new Date().toLocaleDateString()}`

    const { data: list, error } = await supabase
      .from('shopping_lists')
      .insert({
        user_id: user.id,
        trip_name: tripName,
        status: 'active',
        share_token: shareToken,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (!error && list) {
      await supabase.from('shopping_list_items').insert(
        ingredients.map(ing => ({
          shopping_list_id: list.id,
          ingredient_name: ing.name,
          quantity: ing.amount,
          unit: ing.unit,
          checked: false,
          price: ing.price || 0
        }))
      )
      setShareUrl(`${window.location.origin}/list/${shareToken}`)
      onNext(list.id)
    }
    setSaving(false)
  }

  const copyShare = () => {
    navigator.clipboard.writeText(shareUrl)
    setSnackbar(true)
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Your Shopping List</Typography>
        <Chip label={`${ingredients.length} items`} color="primary" size="small" />
      </Box>

      <List dense sx={{ maxHeight: 350, overflowY: 'auto', mb: 2 }}>
        {ingredients.map(ing => (
          <ListItem
            key={ing.name}
            disablePadding
            sx={{
              borderBottom: '1px solid', borderColor: 'divider',
              opacity: checked.includes(ing.name) ? 0.4 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            <Checkbox
              checked={checked.includes(ing.name)}
              onChange={() => toggle(ing.name)}
              color="primary"
              size="small"
            />
            <ListItemText
              primary={ing.name}
              secondary={`${ing.amount} ${ing.unit}`}
              sx={{ textDecoration: checked.includes(ing.name) ? 'line-through' : 'none' }}
            />
          </ListItem>
        ))}
      </List>

      {shareUrl && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          action={
            <Tooltip title="Copy link">
              <IconButton size="small" onClick={copyShare}><ShareIcon fontSize="small" /></IconButton>
            </Tooltip>
          }
        >
          List saved! Share it: <strong>{shareUrl}</strong>
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between">
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={saveAndContinue} disabled={saving}>
          {saving ? 'Saving...' : 'Save & Set Budget →'}
        </Button>
      </Box>

      <Snackbar open={snackbar} autoHideDuration={3000} onClose={() => setSnackbar(false)} message="Share link copied!" />
    </Box>
  )
}