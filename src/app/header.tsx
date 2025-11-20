import Link from "next/link";
import styles from "./header.module.css";

export default function Header() {
    return (
        <div className={styles.header}>
            <Link href="/dashboard" className={styles.shopCompTitle}><h1>ShopComp</h1></Link>
            <Link href="/" className={styles.logoutButton}>Logout</Link>
        </div>
    )
}