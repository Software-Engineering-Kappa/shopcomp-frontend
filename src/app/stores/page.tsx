"use client"

import styles from "./page.module.css"
import React from "react"
import Header from "../header"
import { ChainsPanel, StoresPanel } from "./boundary"
import { Chain, Store } from "./types"
import { backend } from "../../axiosClient"

export default function StoresPage() {

  /* NOTE: CHAIN AND STORE ADDING LOGIC IS TEMPORARY -- WILL NEED TO REFACTOR WITH LAMBDA FUNCTIONS / DATABASE LOGIC */

  const [expandedChainId, setExpandedChainId] = React.useState<number | null>(null)
  const [chains, setChains] = React.useState<Chain[]>([])

  // Fetch chains from database on component mount
  React.useEffect(() => {
    fetchChains();
  }, [])

  // Function to fetch chains from the backend API
  const fetchChains = async () => {
    try {
      const response = await backend.get("/chains");
      const fetchedChains: Chain[] = response.data.chains.map((chain: any) => ({
        id: chain.ID,
        name: chain.name
      }));
      setChains(fetchedChains);
      console.log("Chains fetched successfully:", fetchedChains);
    } catch (error) {
      console.error("Error fetching chains:", error);
    }
  };

  // TODO: Adding chains and stores should call backend API to add to database

  // Function to add a new chain
  function addChain() {
  }

  return (
    <div>
      <Header />
      <main>
        <h1>Stores Page</h1>
        <ChainsPanel chains={chains} expandedChainId={expandedChainId} setExpandedChainId={setExpandedChainId} onAddChain={addChain} />
        <StoresPanel chains={chains} expandedChainId={expandedChainId}/>
      </main>
    </div>
  )
}