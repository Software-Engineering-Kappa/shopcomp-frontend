import Link from "next/link";
import styles from "./header.module.css";
import { unsetAuthorizationToken } from "../axiosClient";

import React from "react"
import { getAuthorizationToken } from "../axiosClient"
import { useRouter } from "next/navigation"

export default function Header() {
  const router = useRouter()

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
      <Link href="/dashboard" className={styles.shopCompTitle}><h1>ShopComp</h1></Link>
      <Link href="/login" className={styles.logoutButton} onClick={handleLogout}>Logout</Link>
    </header>
  )
}
