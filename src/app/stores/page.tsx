"use client"

import styles from "./page.module.css"
import React from "react"
import Header from "../header"
import { ChainsPanel, StoresPanel } from "./boundary"
import { Chain, Store } from "./types"
import { backend } from "../../axiosClient"

export default function StoresPage() {

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
      const fetchedChains = response.data.chains.map((chain: any) => {
        return {
          ...chain,
          content: `${chain.name}: ID ${chain.ID}`
        }
      });
      setChains(fetchedChains);
      console.log("Chains fetched successfully:", fetchedChains);
    } catch (error) {
      console.error("Error fetching chains:", error);
    }
  };

  return (
    <div>
      <Header />
      <main>
        <h1>Stores Page</h1>
        <ChainsPanel chains={chains} expandedChainId={expandedChainId} setExpandedChainId={setExpandedChainId} setChains={setChains} fetchChains={fetchChains} />
        <StoresPanel chains={chains} expandedChainId={expandedChainId}/>
      </main>
    </div>
  )
}
