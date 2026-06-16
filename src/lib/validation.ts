export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * Validates a password against security rules.
 * Returns null if valid, or an error message string listing all failing rules.
 */
export function validatePassword(password: string): string | null {
  const errors: string[] = [];

  if (password.length < 12) errors.push('at least 12 characters');
  if (!/[A-Z]/.test(password)) errors.push('at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('at least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('at least one digit');
  if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password))
    errors.push('at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');

  return errors.length === 0
    ? null
    : `Password must contain: ${errors.join(', ')}.`;
}

/**
 * Validates a file for portfolio upload.
 * Returns null if valid, or an error message string if the file exceeds 50 MB.
 */
export function validatePortfolioFile(file: { name: string; size: number }): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File "${file.name}" exceeds the 50 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB). Please upload a smaller file.`;
  }
  return null;
}
