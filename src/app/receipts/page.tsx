"use client"

import styles from "./page.module.css"
import React from "react"
import { ReceiptSearch, CreateReceiptForm, EditReceiptForm } from "./boundary"
import Header from "../header"

export default function ReceiptsPage() {
  const [createReceipt, setCreateReceipt] = React.useState(false);
  const [editReceipt, setEditReceipt] = React.useState(false);
  const receiptId = React.useRef<number>(-1); // TODO check that not undefined in all that use it

  return (
    <div>
      <Header />
        <main>
          <h1>Receipts</h1>
          <ReceiptSearch createReceipt={createReceipt} receiptId={receiptId}/>
          <button className="edit-receipt" onClick={() => setEditReceipt(true)}>Edit Receipt</button>
          <button className="create-receipt" onClick={() => setCreateReceipt(true)}>Create Receipt</button>
      </main>
      <CreateReceiptForm displayed={createReceipt} setDisplayed={setCreateReceipt}/>
      <EditReceiptForm displayed={editReceipt} setDisplayed={setEditReceipt} receiptId={receiptId}/>
    </div>
  )
}
