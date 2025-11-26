"use client"

import styles from "./page.module.css"
import React from "react"
import { ReceiptSearch, CreateReceiptForm } from "./boundary"
import Header from "../header"

export default function ReceiptsPage() {
  const [createReceipt, setCreateReceipt] = React.useState(false);
  return (
    <div>
      <Header />
        <main>
          <h1>Receipts</h1>
          <ReceiptSearch createReceipt={createReceipt}/>
          <button className="create-receipt" onClick={() => setCreateReceipt(true)}>Create Receipt</button>
      </main>
      <CreateReceiptForm displayed={createReceipt} setDisplayed={setCreateReceipt}/>
    </div>
  )
}
