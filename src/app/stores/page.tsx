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
  const [stores, setStores] = React.useState<Store[]>([])

  // Fetch chains from database on component mount
  React.useEffect(() => {
    fetchChains();
  }, [])

  // Fetch stores when chains change
  React.useEffect(() => {
    for (const chain of chains) {
      fetchStores(chain.id);
    }
  }, [chains])

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

  const fetchStores = async (chainId: number) => {
    try {
      const response = await backend.get(`/chains/${chainId}/stores`);
      const fetchedStores: Store[] = response.data.stores.map((store: any) => ({
        id: store.ID,
        chainId: store.chainID,
        houseNumber: store.houseNumber,
        street: store.street,
        city: store.city,
        state: store.state,
        postCode: store.postCode,
        country: store.country
      }));
      // Append new stores
      setStores(prev => [...prev, ...fetchedStores]);
      console.log("Stores fetched successfully:", fetchedStores);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  // TODO: Adding chains and stores should call backend API to add to database

  // Function to add a new chain
  function addChain() {
  }

  // Function to add a new store
  function addStore() {
  }

  return (
    <div>
      <Header />
      <main>
        <h1>Stores Page</h1>
        <ChainsPanel chains={chains} expandedChainId={expandedChainId} setExpandedChainId={setExpandedChainId} onAddChain={addChain} />
        <StoresPanel chains={chains} stores={stores} expandedChainId={expandedChainId} onAddStore={addStore}/>
      </main>
    </div>
  )
}