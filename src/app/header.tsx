"use client"

import Link from "next/link";
import styles from "./header.module.css";
import { unsetAuthorizationTokens } from "../axiosClient";

import React from "react"
import { getIdToken } from "../axiosClient"
import { useRouter, usePathname } from "next/navigation"

import DashboardIcon from '@mui/icons-material/Dashboard'
import ReceiptIcon from '@mui/icons-material/Receipt'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import StoreIcon from '@mui/icons-material/Store'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
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

  // Navigation links
  const navLinks = [
    { href: "/dashboard/", label: "Dashboard", icon: <DashboardIcon/> },
    { href: "/receipts/", label: "Receipts", icon: <ReceiptIcon/> },
    { href: "/shopping-lists/", label: "Shopping Lists", icon: <ShoppingCartIcon/> },
    { href: "/stores/", label: "Stores", icon: <StoreIcon/> },
    { href: "/purchases/", label: "Purchases", icon: <LocalOfferIcon/> },
  ]

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
      <div className={styles.rightSectionContainer}>
        <div className={styles.navigationButtonContainer}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={
                styles.navigationButton + (pathname === link.href ? " " + styles.active : "")
              }
            >
              {link.label}
              {link.icon}
            </Link>
          ))}
        </div>
        <div className={styles.logoutContainer}>
          <b>{username}</b> <br />
          <b>{role}</b> <br />
          <Link href="/login" className={styles.logoutButton} onClick={handleLogout}>Logout</Link>
        </div>

      </div>
    </header>
  )
}
