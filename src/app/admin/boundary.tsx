"use client"

import React, { useState, useEffect } from "react";
import { backend } from "../../axiosClient";
import styles from "./page.module.css";

// import AxiosMockAdapter from "axios-mock-adapter";

// NOTE: MOCK DATA FOR TESTING 

// const mockInstance = new AxiosMockAdapter(backend, { delayResponse: 500, onNoMatch: "passthrough" });
// mockInstance.onGet("/admin/dashboard").reply(200, {
//     totalShoppers: 12,
//     totalChains: 10,
//     totalStores: 11,
//     totalMoneySpent: 162.72,
// });

// END MOCK

interface DashboardStats {
  totalShoppers: number
  totalChains: number
  totalStores: number
  totalMoneySpent: number
}

export function HighlightStatistics() {
  // Handling State
  const [stats, setStats] = useState<DashboardStats>({
    totalShoppers: 0,
    totalChains: 0,
    totalStores: 0,
    totalMoneySpent: 0,
  })
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await backend.get<DashboardStats>("/admin/dashboard");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <p>Loading highlight statistics...</p>;
  }

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statItem}>
        <h2>Total Shoppers</h2>
        <p>{stats.totalShoppers}</p>
      </div>
      <div className={styles.statItem}>
        <h2>Total Chains</h2>
        <p>{stats.totalChains}</p>
      </div>
      <div className={styles.statItem}>
        <h2>Total Stores</h2>
        <p>{stats.totalStores}</p>
      </div>
      <div className={styles.statItem}>
        <h2>Total Spendings</h2>
        <p>{stats.totalMoneySpent}</p>
      </div>
    </div>
  )
}


export interface Address {
  houseNumber: string;
  street: string;
  city: string;
  state: string;
  postCode: string;
  country: string;
}

interface StoreStats {
  storeId: number,
  address: Address,
  salesTotalAmount: number,
}

interface ChainStats {
  chainId: number,
  chainName: string,
  salesbyStore: StoreStats[]
}

function addressToString(addr: Address) {
  const houseNumber = addr.houseNumber
  const street = addr.street
  const city = addr.city
  const state = addr.state
  const postCode = addr.postCode
  const country = addr.country
  return `${houseNumber} ${street}, ${city}, ${state} ${postCode}, ${country}`
}


export function SalesReportTable() {
  const [salesReport, setSalesReport] = React.useState<ChainStats[]>([])
  const [loading, setLoading] = useState(true);

  // Get sales report upon loading this element
  React.useEffect(() => {
    setLoading(true)
    backend.get<ChainStats[]>("/sales")
      .then((response) => {
        console.log("Got sales report")
        setSalesReport(response.data)
      }).catch((error) => {
        console.log("Error getting sales report: ", error)
      }).finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <p>Loading sales report...</p>
  }

  // Create table rows for every store
  const rows = salesReport.map((chain) => {
    const chainName = chain.chainName
    const stores = chain.salesbyStore
    const numStores = stores.length

    // Get the total sales for this chain
    const chainTotalSales = stores.reduce((acc, curr) => {
      return acc + Number(curr.salesTotalAmount)
    }, 0)

    // Ignore chains for which there is no stores
    if (numStores == 0) return

    // For each store in the chain, create a table row
    let storeRows = []
    for (let i = 0; i < numStores; i++) {
      const store = stores[i]

      // The chain name and chain total sales will be merged cells that span over the store rows.
      // We only include these rows in only the first row for this chain.
      const chainNameRow = <td rowSpan={numStores}>{chainName}</td>
      const chainTotalRow = <td rowSpan={numStores}>${chainTotalSales.toFixed(2)}</td>
      const isFirstStoreInChain = (i === 0)

      // +-----------+------------------+-----------------+
      // | chainName |  stores[0] info  | chainTotalSales |
      // |           +------------------+                 |
      // |           |  stores[1] info  |                 |
      // |           +------------------+                 |
      // |           |  stores[2] info  |                 |
      // +-----------+------------------+-----------------+

      storeRows.push(
        <tr key={`${chain.chainId}-${store.storeId}`}>
          {isFirstStoreInChain && chainNameRow}
          <td>{addressToString(store.address)}</td>
          <td>${store.salesTotalAmount}</td>
          {isFirstStoreInChain && chainTotalRow}
        </tr>
      )
    }

    return storeRows
  })

  // Remove rows for which there is a chain with no store
  rows.filter((chain) => chain !== undefined)

  return (
    <div className={styles.salesReportTableContainer}>
      <table className={styles.salesReportTable}>
        <thead>
          <tr>
            <th>Chain</th>
            <th>Store Location</th>
            <th>Store Total</th>
            <th>Chain Total</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  )
}


