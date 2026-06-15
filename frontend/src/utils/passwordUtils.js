/**
 * Validates password strength
 * Requirements:
 * - At least 8 characters
 * - At least one letter (uppercase or lowercase)
 * - At least one number
 * - At least one special character
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push("Password is required");
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    errors.push("Password must contain at least one letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Returns password strength information
 */
export const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: '', color: '' };
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const hasMinLength = password.length >= 8;
  
  if (hasLetter && hasNumber && hasSpecial && hasMinLength) {
    return { strength: 100, label: 'Strong', color: 'bg-green-500' };
  } else if (hasLetter && hasNumber && hasSpecial) {
    return { strength: 66, label: 'Good', color: 'bg-yellow-500' };
  } else {
    return { strength: 33, label: 'Weak', color: 'bg-red-500' };
  }
};
