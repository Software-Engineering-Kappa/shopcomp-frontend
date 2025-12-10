"use client"

import styles from "./page.module.css"
import React from "react"
import Header from "../header"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()

  // Redirect to /dashboard page if not an admin
  React.useEffect(() => {
    const role = localStorage.getItem("role")
    if (role === null || role !== "admin") {
      console.log("Not authorized to be on admin page. Redirecting to /dashboard")
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div>
      <Header />
      <main>
        <h1>Admin page</h1>
      </main>
    </div>
  )
}


