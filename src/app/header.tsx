import Link from "next/link";
import styles from "./header.module.css";
import { unsetAuthorizationToken } from "../axiosClient";

export default function Header() {
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
