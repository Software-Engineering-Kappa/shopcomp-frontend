import Link from "next/link";
import styles from "./header.module.css";
import { unsetAuthorizationToken } from "../axiosClient";

import React from "react"
import { getAuthorizationToken } from "../axiosClient"
import { useRouter } from "next/navigation"

export default function Header() {
  const router = useRouter()

  // Redirect to /login if not logged-in
  React.useEffect(() => {
    const token = getAuthorizationToken()
    if (token === null) {
      console.log("Not logged in. Redirecting to /login")
      router.push("/login")
    }
  }, [router])

  function handleLogout() {
    unsetAuthorizationToken()
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
      <Link href="/login" className={styles.logoutButton} onClick={handleLogout}>Logout</Link>
    </header>
  )
}
