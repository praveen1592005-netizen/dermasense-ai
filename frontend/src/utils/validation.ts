export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  hasLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  const hasLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasLength) score += 1;
  if (hasUppercase && hasLowercase) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;

  if (password.length === 0) {
    return {
      score: 0,
      label: 'Very Weak',
      color: 'bg-slate-300 dark:bg-slate-700',
      hasLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecial: false,
    };
  }

  let label: PasswordStrength['label'] = 'Very Weak';
  let color = 'bg-rose-500';

  if (score === 1) {
    label = 'Weak';
    color = 'bg-rose-500';
  } else if (score === 2) {
    label = 'Fair';
    color = 'bg-amber-500';
  } else if (score === 3) {
    label = 'Good';
    color = 'bg-blue-500';
  } else if (score >= 4) {
    label = 'Strong';
    color = 'bg-emerald-500';
  }

  return {
    score,
    label,
    color,
    hasLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
  };
}
