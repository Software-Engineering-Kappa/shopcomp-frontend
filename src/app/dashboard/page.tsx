"use client"

import styles from "./page.module.css"
import React from "react"
import Link from "next/link"
import Header from "../header"
import { HighlightStatistics, ReviewHistory } from "./boundary"

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
        <HighlightStatistics/>
        <h4 className={styles.sectionHeader}>Review History</h4>
        <ReviewHistory/>
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


