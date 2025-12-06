"use client"

import styles from "./page.module.css";

import React from "react"
import { getIdToken } from "../axiosClient"
import { useRouter } from "next/navigation"

export default function RootPage() {
  const router = useRouter()

  // Redirect to /login if not logged-in, or to /dashboard if logged-in
  React.useEffect(() => {
    const token = getIdToken()
    if (token === null) {
      console.log("Not logged in. Redirecting to /login")
      router.push("/login")
    } else {
      console.log("Already logged in. Redirecting to /dashboard")
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Redirecting...</h1>
      </main>
    </div>
  );
}
