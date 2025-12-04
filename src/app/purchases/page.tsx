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
//     id: number,
//     itemName: string,
//     itemCategory: string,
//     itemMostRecentPrice: number,
//     purchaseDate: string,
//     purchasePrice: number,
//     chainName: string,
//     address: {
//         houseNumber: string,
//         street: string,
//         city: string,
//         state: string,
//         postCode: string,
//         country: string
//     }
// }
    const samplePurchases: Purchase[] = [
      {
        id: 1,
        itemName: "Apples",
        itemCategory: "Produce",
        itemMostRecentPrice: 3.50,
        purchaseDate: "11-08-2025",
        purchasePrice: 3.50,
        chainName: "Shaw's",
        address: {
          houseNumber: "14",
          street: "W Boylston St",
          city: "Worcester",
          state: "MA",
          postCode: "01606",
          country: "USA"
        }
      },
      {
        id: 2,
        itemName: "Bananas",
        itemCategory: "Produce",
        itemMostRecentPrice: 2.00,
        purchaseDate: "11-09-2025",
        purchasePrice: 2.00,
        chainName: "Price Chopper",
        address: {
          houseNumber: "143",
          street: "some other street",
          city: "Worcester",
          state: "MA",
          postCode: "01606",
          country: "USA"
        }
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
