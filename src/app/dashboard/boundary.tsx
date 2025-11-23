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

mockInstance.onGet(/\/shopper\/review_history/).reply((config) => {
    // Extract timeUnit from query params
    const url = new URL(config.url || '', 'http://localhost');
    const timeUnit = url.searchParams.get('timeUnit') || 'month';

    // Return different data based on timeUnit
    const mockData = {
        day: {
            timeUnit: "day",
            numReceipts: 2,
            numPurchases: 8,
            totalPurchaseAmount: 45.50,
            numStoresVisited: 2
        },
        week: {
            timeUnit: "week",
            numReceipts: 7,
            numPurchases: 28,
            totalPurchaseAmount: 210.75,
            numStoresVisited: 4
        },
        month: {
            timeUnit: "month",
            numReceipts: 25,
            numPurchases: 120,
            totalPurchaseAmount: 850.00,
            numStoresVisited: 8
        },
        year: {
            timeUnit: "year",
            numReceipts: 300,
            numPurchases: 1440,
            totalPurchaseAmount: 10200.00,
            numStoresVisited: 15
        }
    };

    return [200, mockData[timeUnit as keyof typeof mockData] || mockData.month];
});

// END MOCK

interface DashboardStats {
    totalReceipts: number;
    totalShoppingLists: number;
    totalPurchases: number;
}

interface ReviewHistoryStats {
    timeUnit: string;
    numReceipts: number;
    numPurchases: number;
    totalPurchaseAmount: number;
    numStoresVisited: number;
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
                setLoading(true);
                const response = await backend.get<DashboardStats>("/shopper/dashboard");
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
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
                <h2>Total Receipts</h2>
                <p>{stats.totalReceipts}</p>
            </div>
            <div className={styles.statItem}>
                <h2>Total Shopping Lists</h2>
                <p>{stats.totalShoppingLists}</p>
            </div>
            <div className={styles.statItem}>
                <h2>Total Purchases</h2>
                <p>{stats.totalPurchases}</p>
            </div>
            <div className={styles.statItem}>
                <h2>Money Saved</h2>
                <p>$1000</p>
            </div>
        </div>
    )
}

export function ReviewHistory() {

    // Handling State
    const [stats, setStats] = useState<ReviewHistoryStats>({
        timeUnit: "month",
        numReceipts: 0,
        numPurchases: 0,
        totalPurchaseAmount: 0,
        numStoresVisited: 0
    });
    const [timeUnit, setTimeUnit] = useState("month");
    const [loading, setLoading] = useState(true);

    // Handle dropdown change
    const handleTimeUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTimeUnit(event.target.value);
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                console.log("Fetching review history for timeUnit:", timeUnit);  // Debug log
                const response = await backend.get<ReviewHistoryStats>(`/shopper/review_history?timeUnit=${timeUnit}`);
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching review history stats:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [timeUnit]);

    if (loading) {
        return <p>Loading review history...</p>;
    }

    return (
        <div>
            <div className={styles.filterContainer}>
                <label htmlFor="time-unit">Time Period: </label>
                <select
                    id="time-unit"
                    value={timeUnit}
                    onChange={handleTimeUnitChange}
                    className={styles.dropdown}
                >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                </select>
            </div>
            <div className={styles.statsContainer}>
                <div className={styles.statItem}>
                    <h2>Receipts</h2>
                    <p>{stats.numReceipts}</p>
                </div>
                <div className={styles.statItem}>
                    <h2>Purchases</h2>
                    <p>{stats.numPurchases}</p>
                </div>
                <div className={styles.statItem}>
                    <h2>Purchase Amount</h2>
                    <p>${stats.totalPurchaseAmount.toFixed(2)}</p>
                </div>
                <div className={styles.statItem}>
                    <h2>Stores Visited</h2>
                    <p>{stats.numStoresVisited}</p>
                </div>
            </div>
        </div>
    )
}

