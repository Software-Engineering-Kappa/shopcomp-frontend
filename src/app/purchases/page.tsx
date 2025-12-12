"use client"

import styles from "./page.module.css"
import React from "react"
import Header from "../header"
import { PurchasesPanel, PurchasePanel } from "./boundary"
import { Purchase } from "./types"
import { backend } from "../../axiosClient"

export default function PurchasesPage() {

  const [expandedPurchaseId, setExpandedPurchaseId] = React.useState<number | null>(null)
  const [purchases, setPurchases] = React.useState<Purchase[]>([])

  // Fetch purchases from database on component mount
  React.useEffect(() => {
    fetchPurchases();
  }, [])

  // Function to fetch purchases from the backend API
  const fetchPurchases = async () => {

    try {
      const response = await backend.get("/purchases");
      const fetchedPurchases = response.data.purchases.map((purchase: any) => {
        return {
          ...purchase,
          content: `${purchase.itemName} - ${purchase.chainName} (${new Date(purchase.purchaseDate).toLocaleDateString()})`,
          id: purchase.purchaseId
      }});
      setPurchases(fetchedPurchases);
      console.log("Purchases fetched successfully:", fetchedPurchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
    }
  };

  return (
    <div>
      <Header />
      <main>
        <h1>Purchases Page</h1>
        <PurchasesPanel purchases={purchases} setExpandedPurchaseId={setExpandedPurchaseId} />
        <PurchasePanel purchases={purchases} expandedPurchaseId={expandedPurchaseId}/>
      </main>
    </div>
  )
}
