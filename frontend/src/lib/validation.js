// Simple validation helpers used by auth forms
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function getPasswordStrength(password) {
  const suggestions = []
  let score = 0

  if (password.length >= 8) score++
  else suggestions.push('Use at least 8 characters')

  if (/[a-z]/.test(password)) score++
  else suggestions.push('Add lowercase letters')

  if (/[A-Z]/.test(password)) score++
  else suggestions.push('Add uppercase letters')

  if (/\d/.test(password)) score++
  else suggestions.push('Add numbers')

  if (/[^A-Za-z0-9]/.test(password)) {
    // extra bonus for special chars
    score++
  } else {
    suggestions.push('Add special characters (e.g. !@#$)')
  }

  // Normalize score to 0..4
  const normalized = Math.max(0, Math.min(4, score))

  let label = 'Very Weak'
  let color = 'text-destructive'
  let pct = 20
  if (normalized <= 1) {
    label = 'Weak'
    color = 'text-destructive'
    pct = 25
  } else if (normalized === 2) {
    label = 'Fair'
    color = 'text-amber-500'
    pct = 50
  } else if (normalized === 3) {
    label = 'Good'
    color = 'text-primary'
    pct = 75
  } else if (normalized >= 4) {
    label = 'Strong'
    color = 'text-green-600'
    pct = 100
  }

  return { score: normalized, label, color, pct, suggestions }
}
