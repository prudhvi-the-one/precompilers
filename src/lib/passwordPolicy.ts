export const PASSWORD_SPECIAL_CHARS = "!@#$%^&*()_+-=";

type PasswordRule = {
  key: string;
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  {
    key: "length",
    label: "At least 8 characters",
    test: (password) => password.length >= 8,
  },
  {
    key: "letter",
    label: "Contains a letter",
    test: (password) => /[A-Za-z]/.test(password),
  },
  {
    key: "number",
    label: "Contains a number",
    test: (password) => /\d/.test(password),
  },
  {
    key: "special",
    label: `Contains a special character (${PASSWORD_SPECIAL_CHARS})`,
    test: (password) => /[!@#$%^&*()_+\-=]/.test(password),
  },
  {
    key: "charset",
    label: "Only letters, numbers, and the special characters above",
    test: (password) => /^[A-Za-z0-9!@#$%^&*()_+\-=]*$/.test(password),
  },
];

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
