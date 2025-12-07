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
      const fetchedPurchases: Purchase[] = response.data.purchases.map((purchase: any) => ({
        purchaseId: purchase.purchaseId,
        itemName: purchase.itemName,
        itemCategory: purchase.itemCategory,
        itemMostRecentPrice: purchase.itemMostRecentPrice,
        purchaseDate: purchase.purchaseDate,
        purchasePrice: purchase.purchasePrice,
        purchaseQuantity: purchase.purchaseQuantity,
        chainName: purchase.chainName,
        address: {
            houseNumber: purchase.address.houseNumber,
            street: purchase.address.street,
            city: purchase.address.city,
            state: purchase.address.state,
            postCode: purchase.address.postCode,
            country: purchase.address.country
        }
      }));
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
        <PurchasesPanel purchases={purchases} expandedPurchaseId={expandedPurchaseId} setExpandedPurchaseId={setExpandedPurchaseId} />
        <PurchasePanel purchases={purchases} expandedPurchaseId={expandedPurchaseId}/>
      </main>
    </div>
  )
}
