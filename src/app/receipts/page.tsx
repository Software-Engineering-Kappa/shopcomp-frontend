"use client"

import styles from "./page.module.css"
import React from "react"
import { ReceiptSearch, CreateReceiptForm, EditReceiptForm, AnalyzeWithAIForm } from "./boundary"
import Header from "../header"
import { Receipt } from "./types"

export default function ReceiptsPage() {
  const [createReceipt, setCreateReceipt] = React.useState(false);
  const [editReceipt, setEditReceipt] = React.useState(false);
  const [receiptId, setReceiptId] = React.useState(-1);
  const allCategories = React.useRef<string[]>([]);

  const [receipt, setReceipt] = React.useState<Receipt>()

  const handleEditReceiptClick = () => {
    if (/*receiptId >= 0 && */!createReceipt)
      setEditReceipt(true);
  }

  const handleCreateReceiptClick = () => {
    if (!editReceipt)
      setCreateReceipt(true);
  }

  return (
    <div>
      <Header />
      <main>
        <h1>Receipts</h1>
        <ReceiptSearch createReceipt={createReceipt} editReceipt={editReceipt} setReceiptId={setReceiptId} />
        <button type="button" className="edit-receipt" onClick={() => handleEditReceiptClick()}>Edit Receipt</button>
        <button type="button" className="create-receipt" onClick={() => handleCreateReceiptClick()}>Create Receipt</button>
      </main>
      <CreateReceiptForm displayed={createReceipt} setDisplayed={setCreateReceipt} setEditReceiptDisplayed={setEditReceipt} setReceiptId={setReceiptId} />
      <EditReceiptForm
        displayed={editReceipt}
        setDisplayed={setEditReceipt}
        receiptId={receiptId}
        receipt={receipt}
        setReceipt={setReceipt}
      />
      <br />
      {receipt && receipt.items.length === 0 &&
        <AnalyzeWithAIForm
          receiptId={receiptId}
          receipt={receipt}
          setReceipt={setReceipt}
        />
      }
    </div>
  )
}
