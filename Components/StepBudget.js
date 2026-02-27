'use client'
import { useState } from 'react'
import {
  Box, Typography, TextField, Button, LinearProgress,
  Alert, List, ListItem, ListItemText, InputAdornment, Chip
} from '@mui/material'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

export default function StepBudget({ ingredients, listId, onBack }) {
  const [budget, setBudget] = useState('')
  const [prices, setPrices] = useState({})
  const [done, setDone] = useState(false)

  const setPrice = (name, val) => setPrices(p => ({ ...p, [name]: parseFloat(val) || 0 }))

  const total = Object.values(prices).reduce((s, v) => s + v, 0)
  const budgetNum = parseFloat(budget) || 0
  const pct = budgetNum > 0 ? Math.min((total / budgetNum) * 100, 100) : 0
  const over = budgetNum > 0 && total > budgetNum
  const near = budgetNum > 0 && !over && pct >= 80

  const color = over ? 'error' : near ? 'warning' : 'primary'

  if (done) return (
    <Box textAlign="center" py={6}>
      <CheckCircleIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
      <Typography variant="h5" fontWeight={700} mb={1}>You're all set! 🎉</Typography>
      <Typography color="text.secondary" mb={3}>
        Your shopping list has been saved. Happy grocery shopping!
      </Typography>
      <Button variant="outlined" onClick={() => window.location.reload()}>Start a New Trip</Button>
    </Box>
  )

  return (
    <Box>
      <Typography variant="h6" mb={1}>Set Your Budget</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Enter your total budget and estimated prices per item.
      </Typography>

      <TextField
        fullWidth
        label="Total Budget"
        type="number"
        value={budget}
        onChange={e => setBudget(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon /></InputAdornment> }}
        sx={{ mb: 3 }}
        size="small"
      />

      {budgetNum > 0 && (
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2">Spent: <strong>${total.toFixed(2)}</strong></Typography>
            <Typography variant="body2">Budget: <strong>${budgetNum.toFixed(2)}</strong></Typography>
          </Box>
          <LinearProgress variant="determinate" value={pct} color={color} sx={{ height: 10, borderRadius: 5 }} />
          {over && <Alert severity="error" sx={{ mt: 1 }}>⚠️ Over budget by ${(total - budgetNum).toFixed(2)}!</Alert>}
          {near && !over && <Alert severity="warning" sx={{ mt: 1 }}>You're at {pct.toFixed(0)}% of your budget.</Alert>}
        </Box>
      )}

      <Typography variant="subtitle2" mb={1}>Estimate prices per item:</Typography>
      <List dense sx={{ maxHeight: 260, overflowY: 'auto', mb: 3 }}>
        {ingredients.map(ing => (
          <ListItem key={ing.name} sx={{ borderBottom: '1px solid', borderColor: 'divider', gap: 2 }}>
            <ListItemText primary={ing.name} secondary={`${ing.amount} ${ing.unit}`} sx={{ flex: 1 }} />
            <TextField
              size="small"
              type="number"
              placeholder="0.00"
              value={prices[ing.name] || ''}
              onChange={e => setPrice(ing.name, e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              sx={{ width: 110 }}
            />
          </ListItem>
        ))}
      </List>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button onClick={onBack}>Back</Button>
        <Box display="flex" gap={1} alignItems="center">
          {total > 0 && <Chip label={`Total: $${total.toFixed(2)}`} color={color} />}
          <Button variant="contained" onClick={() => setDone(true)}>Finish Trip ✓</Button>
        </Box>
      </Box>
    </Box>
  )
}