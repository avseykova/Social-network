export const required = (v: string) => !!v || 'This field is required';
export const email = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email';
export const minLength = (v: string) =>
  v.length >= PASSWORD_MIN_LENGTH ||
  `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
export const maxLength = (v: string) =>
  v.length <= PASSWORD_MAX_LENGTH ||
  `Password must be at most ${PASSWORD_MAX_LENGTH} characters`;

const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 20;

export const validationRules = {
  required,
  email,
  minLength,
  maxLength,
};
