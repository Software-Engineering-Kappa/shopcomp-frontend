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
    // try {
    //   const response = await backend.get("/chains");
    //   const fetchedChains: Chain[] = response.data.chains.map((chain: any) => ({
    //     id: chain.ID,
    //     name: chain.name
    //   }));
    //   setChains(fetchedChains);
    //   console.log("Chains fetched successfully:", fetchedChains);
    // } catch (error) {
    //   console.error("Error fetching chains:", error);
    // }

    // Load sample data for now
    // export type Purchase = {
    //   id: number
    //   itemName: string
    //   price: number
    //   chainName: string
    //   storeAddress:{
    //       houseNumber: string
    //       street: string
    //       city: string
    //       state: string
    //       postCode: string
    //       country: string
    //   }
    //   date: string
    // }
    const samplePurchases: Purchase[] = [
      {
        id: 1,
        itemName: "Apples",
        price: 3.50,
        chainName: "Shaw's",
        storeAddress: {
          houseNumber: "14",
          street: "W Boylston St",
          city: "Worcester",
          state: "MA",
          postCode: "01606",
          country: "USA"
        },
        date: "11-08-2025"
      },
      {
        id: 2,
        itemName: "Bananas",
        price: 2.00,
        chainName: "Price Chopper",
        storeAddress: {
          houseNumber: "143",
          street: "some other street",
          city: "Worcester",
          state: "MA",
          postCode: "01606",
          country: "USA"
        },
        date: "11-09-2025"
      }
    ];

    setPurchases(samplePurchases);
  }

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
