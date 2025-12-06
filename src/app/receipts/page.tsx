"use client"

import styles from "./page.module.css"
import React from "react"
import { ReceiptSearch, CreateReceiptForm, EditReceiptForm } from "./boundary"
import Header from "../header"

export default function ReceiptsPage() {
  const [createReceipt, setCreateReceipt] = React.useState(false);
  const [editReceipt, setEditReceipt] = React.useState(false);
  const [receiptId, setReceiptId] = React.useState(-1);

  return (
    <div>
      <Header />
        <main>
          <h1>Receipts</h1>
          <ReceiptSearch createReceipt={createReceipt} setReceiptId={setReceiptId}/>
          <button type="button" className="edit-receipt" onClick={() => {if (receiptId >= 0) setEditReceipt(true)}}>Edit Receipt</button>
          <button type="button" className="create-receipt" onClick={() => setCreateReceipt(true)}>Create Receipt</button>
      </main>
      <CreateReceiptForm displayed={createReceipt} setDisplayed={setCreateReceipt}/>
      <EditReceiptForm displayed={editReceipt} setDisplayed={setEditReceipt} receiptId={receiptId}/>
    </div>
  )
}
