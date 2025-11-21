"use client"

import styles from "./page.module.css"
import React from "react"
import Header from "../header"
import { ChainsPanel, StoresPanel } from "./boundary"
import { Chain } from "./types"

export default function StoresPage() {

  /* NOTE: CHAIN AND STORE ADDING LOGIC IS TEMPORARY -- WILL NEED TO REFACTOR WITH LAMBDA FUNCTIONS / DATABASE LOGIC */

  const [expandedChainId, setExpandedChainId] = React.useState<number | null>(null)

  const initialChains: Chain[] = [
    { id: 1, name: "FreshMart", stores: ["Downtown", "Uptown", "Riverside"] },
    { id: 2, name: "QuickShop", stores: ["Northside", "Airport"] },
    { id: 3, name: "CornerFoods", stores: ["Main St", "Elm St", "Oak Ave"] },
  ]

  const [chains, setChains] = React.useState<Chain[]>(initialChains)

  // Function to add a new chain
  function addChain(name: string) {
    if (!name || !name.trim()) return
    setChains((prev) => {
      // Generates a new unique ID for the chain
      const nextId = prev.length ? Math.max(...prev.map((c) => c.id)) + 1 : 1
      return [...prev, { id: nextId, name: name.trim(), stores: [] }]
    })
  }
  
  // Function to add a new store
  function addStore(chainId: number, storeName: string) {
    const name = storeName?.trim()
    if (!name || !name.trim()) return
    setChains((prev) => {
      return prev.map((c) => c.id === chainId ? { ...c, stores: [...c.stores, name] } : c)
    })
      
  }

  return (
    <div>
      <Header />
      <main>
        <h1>Stores Page</h1>
        <ChainsPanel chains={chains} expandedChainId={expandedChainId} setExpandedChainId={setExpandedChainId} onAddChain={addChain} />
        <StoresPanel chains={chains} expandedChainId={expandedChainId} onAddStore={addStore} />
      </main>
    </div>
  )
}