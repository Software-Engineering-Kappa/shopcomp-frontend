"use client"

import styles from "./page.module.css"
import React from "react"
import Link from "next/link"
import Header from "../header"

export default function DashboardPage() {
  const [redraw, forceRedraw] = React.useState(0)

  // helper function that forces React app to redraw whenever this is called.
  function andRefreshDisplay() {
    forceRedraw(redraw + 1)
  }


  return (
    <div>
      <Header />
      <main>
        <h4 className={styles.sectionHeader}>Highlight Statistics</h4>
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <h2>Receipts</h2>
            <p>5</p>
          </div>
          <div className={styles.statItem}>
            <h2>Shopping Lists</h2>
            <p>3</p>
          </div>
          <div className={styles.statItem}>
            <h2>Purchases</h2>
            <p>120</p>
          </div>
          <div className={styles.statItem}>
            <h2>Money Saved</h2>
            <p>$1000</p>
          </div>
        </div>

        <h4 className={styles.sectionHeader}>Recent Receipts List</h4>
        <h4 className={styles.sectionHeader}>Recent Shopping List</h4>
        <button onClick={andRefreshDisplay}>View Receipts</button>
        <button onClick={andRefreshDisplay}>View Shopping Lists</button>
        <button onClick={andRefreshDisplay}>View Stores</button>
        <button onClick={andRefreshDisplay}>Search Recent Purchases</button>
      </main>
    </div>
  )
}


