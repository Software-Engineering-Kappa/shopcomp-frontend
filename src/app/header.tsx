"use client"

import Link from "next/link";
import styles from "./header.module.css";
import { unsetAuthorizationTokens } from "../axiosClient";

import React from "react"
import { getIdToken } from "../axiosClient"
import { useRouter } from "next/navigation"

export default function Header() {
  const router = useRouter()
  const [username, setUsername] = React.useState("")
  const [role, setRole] = React.useState("")

  // Runs when the page is mounted on the client side
  React.useEffect(() => {
    // Get username and role from localStorage
    setUsername(localStorage.getItem("username") || "user")
    setRole(localStorage.getItem("role") || "shopper")

    // Redirect to /login if not logged-in
    const token = getIdToken()
    if (token === null) {
      console.log("Not logged in. Redirecting to /login")
      router.push("/login")
    }
  }, [router])

  function handleLogout() {
    unsetAuthorizationTokens()
    localStorage.removeItem("username")
    localStorage.removeItem("role")
  }

  return (
    <header className={styles.header}>
      <Link href="/dashboard" className={styles.shopCompTitle}>
        <span style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/ShopComp-logo-no-text.png"
            alt="ShopComp Logo"
            style={{ height: "80px", marginRight: "12px" }}
          />
          <h1>ShopComp</h1>
        </span>
      </Link>
      <div className={styles.logoutContainer}>
        <b>{username}</b> <br/>
        <b>{role}</b> <br/>
        <Link href="/login" className={styles.logoutButton} onClick={handleLogout}>Logout</Link>
      </div>
    </header>
  )
}
