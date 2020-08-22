exports.validate = (password, repeat_password) => {

    if(password !== repeat_password) return "Your passwords must match"
    if(password.length < 8) return "Your password must be at least 8 characters"
    if(!/[A-Z]/.test(password))  return "Your password must contain at least 1 uppercase letter"

    return "okay"
}
