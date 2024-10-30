export function validatePassword(password: string) {
    if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
    }
}
