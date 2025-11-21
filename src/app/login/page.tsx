"use client"

import styles from "./page.module.css"
import React from "react"

export default function LoginPage() {
  const [showRegister, setShowRegister] = React.useState(false)

  return (
    <div>
      <main>
        <header className={styles.header}>
          <h1>ShopComp Login</h1>
        </header>
        {!showRegister ? (
          <LoginForm onCreateAccount={() => setShowRegister(true)} />
        ) : (
          <RegisterForm onBackToLogin={() => setShowRegister(false)} />
        )}
      </main>
    </div>
  )
}


function LoginForm({ onCreateAccount }: { onCreateAccount: () => void }) {
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [role, setRole] = React.useState<"shopper" | "admin">("shopper")
  const [error, setError] = React.useState("")

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const userValue = username.trim()
    const passwordValue = password.trim()
    const roleValue = role

    if (!userValue || !passwordValue || !roleValue) {
      setError("Please enter username/email, password, and select a role.")
      return
    }

    // Variables for further handling
    // userValue, passwordValue, roleValue
    // You can handle them as needed here
  }


  return (
    <div className={styles.loginFormContainer}>
      <form className={styles.loginFormBox}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel} htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            className={styles.inputField}
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel} htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            className={styles.inputField}
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div className={styles.radioGroup}>
          <label>
            <input
              type="radio"
              name="role"
              value="shopper"
              checked={role === "shopper"}
              onChange={() => setRole("shopper")}
            />
            Shopper
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="admin"
              checked={role === "admin"}
              onChange={() => setRole("admin")}
            />
            Administrator
          </label>
        </div>
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.loginButton}
            onClick={handleLogin}
          >
            Login
          </button>
          {role === "shopper" && (
            <button
              type="button"
              className={styles.createAccountButton}
              onClick={onCreateAccount}
            >
              Create Account
            </button>
          )}
        </div>
        <div className={styles.errorText}>
          {error && <span>{error}</span>}
        </div>
      </form>
    </div>
  )
}


export function RegisterForm({ onBackToLogin }: { onBackToLogin: () => void }) {
  const [username, setUsername] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [confirmationSent, setConfirmationSent] = React.useState(false)
  const [confirmationCode, setConfirmationCode] = React.useState("")

  function handleRegister(e: React.MouseEvent) {
    e.preventDefault()
    setError("")

    const usernameValue = username.trim()
    const emailValue = email.trim()
    const passwordValue = password.trim()

    if (!usernameValue || !emailValue || !passwordValue) {
      setError("Please fill in all fields.")
      return
    }

    // Registration request logic goes here

    setConfirmationSent(true)
  }

  function handleConfirm(e: React.MouseEvent) {
    e.preventDefault()
    setError("")

    const codeValue = confirmationCode.trim()
    if (!codeValue) {
      setError("Please enter the confirmation code.")
      return
    }

    // Confirmation code handling logic goes here
  }

  return (
    <div className={styles.loginFormContainer}>
      <form className={styles.loginFormBox}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel} htmlFor="reg-username">Username:</label>
          <input
            id="reg-username"
            type="text"
            className={styles.inputField}
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            disabled={confirmationSent}
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel} htmlFor="reg-email">Email:</label>
          <input
            id="reg-email"
            type="email"
            className={styles.inputField}
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            disabled={confirmationSent}
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel} htmlFor="reg-password">Password:</label>
          <input
            id="reg-password"
            type="password"
            className={styles.inputField}
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={confirmationSent}
          />
        </div>
        {!confirmationSent ? (
          <>
            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.loginButton}
                onClick={handleRegister}
              >
                Register
              </button>
            </div>
            <div className={styles.textLinkContainer}>
              <span
                className={styles.textLink}
                onClick={onBackToLogin}
                tabIndex={0}
                role="button"
              >
                Already Have account
              </span>
            </div>
          </>
        ) : (
          <>
            <div className={styles.confirmationText}>
              Confirmation code has been sent to your email
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="confirmation-code">Confirmation code:</label>
              <input
                id="confirmation-code"
                type="text"
                className={styles.inputField}
                value={confirmationCode}
                onChange={e => setConfirmationCode(e.target.value)}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.loginButton}
                onClick={handleConfirm}
              >
                Confirm Code
              </button>
            </div>
          </>
        )}
        <div className={styles.errorText}>
          {error && <span>{error}</span>}
        </div>
      </form>
    </div>
  )
}

