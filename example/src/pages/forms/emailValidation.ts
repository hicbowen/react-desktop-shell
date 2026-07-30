const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function getEmailValidationError(email: string) {
  const normalizedEmail = email.trim()

  if (!normalizedEmail) return 'Email is required'
  if (!emailPattern.test(normalizedEmail)) {
    return 'Enter a valid email address'
  }
  return null
}
