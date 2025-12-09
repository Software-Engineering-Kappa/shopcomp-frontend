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

