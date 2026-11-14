export type ChangePasswordFormValues = {
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
}

export const defaultChangePasswordFormValues = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
}