import React, { useState, useEffect } from "react";
import axios from "axios";
import { backend } from "../../axiosClient";
import styles from "./page.module.css";
import AxiosMockAdapter from "axios-mock-adapter";

// MOCK DATA FOR TESTING - Remove when backend is ready
const mockInstance = new AxiosMockAdapter(backend, { delayResponse: 500 });
mockInstance.onGet("/shopper/dashboard").reply(200, {
    totalReceipts: 12,
    totalShoppingLists: 5,
    totalPurchases: 47
});
// END MOCK

interface DashboardStats {
    totalReceipts: number;
    totalShoppingLists: number;
    totalPurchases: number;
}

export function HighlightStatistics() {
    // Handling State
    const [stats, setStats] = useState<DashboardStats>({
        totalReceipts: 0,
        totalShoppingLists: 0,
        totalPurchases: 0
    });
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await backend.get<DashboardStats>("/shopper/dashboard");
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }), [];

    return (
        <div className={styles.statsContainer}>
            <div className={styles.statItem}>
                <h2>Receipts</h2>
                <p>{stats.totalReceipts}</p>
            </div>
            <div className={styles.statItem}>
                <h2>Shopping Lists</h2>
                <p>{stats.totalShoppingLists}</p>
            </div>
            <div className={styles.statItem}>
                <h2>Purchases</h2>
                <p>{stats.totalPurchases}</p>
            </div>
            <div className={styles.statItem}>
                <h2>Money Saved</h2>
                <p>$1000</p>
            </div>
        </div>
    )
}

