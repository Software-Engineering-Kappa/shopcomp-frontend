"use client"
import React from "react"
import styles from "./page.module.css"
import { Purchase } from "./types"
import { backend } from "../../axiosClient"

// Function that renders the list of purchases with a search bar
function PurchasesPanel({ purchases, expandedPurchaseId, setExpandedPurchaseId }: { purchases: Purchase[]; expandedPurchaseId: number | null; setExpandedPurchaseId: (id: number | null) => void; }) {
    const [purchaseQuery, setPurchaseQuery] = React.useState("")

    // Filter purchases based on purchaseQuery
    const filteredPurchases = purchases.filter((p) => `${p.itemName} - ${p.chainName} (${new Date(p.purchaseDate).toLocaleDateString()})`.toLowerCase().includes(purchaseQuery.trim().toLowerCase()))
    return (
        <section>
            <h2>Purchases</h2>
            <input
                placeholder="Search purchases..."
                onChange={(e) => setPurchaseQuery(e.target.value)}
            />

            <ul>
                {filteredPurchases.map((p) => (
                    <PurchaseItem key={p.id} purchase={p} expandedPurchaseId={expandedPurchaseId} setExpandedPurchaseId={setExpandedPurchaseId} />
                ))}
            </ul>
        </section>
    )
}

// Function that renders a single purchase (A purchase in the list)
function PurchaseItem({ purchase, expandedPurchaseId, setExpandedPurchaseId }: { purchase: Purchase; expandedPurchaseId: number | null; setExpandedPurchaseId: (id: number | null) => void }) {
    const isSelected = expandedPurchaseId === purchase.id
    console.log("Rendering purchaseId:", purchase.id);
    return (
        <li onClick={() => setExpandedPurchaseId(isSelected ? null : purchase.id)}>
            <span>{purchase.itemName} - {purchase.chainName} ({new Date(purchase.purchaseDate).toLocaleDateString()})</span>
            <span>{isSelected ? " (selected)" : ""}</span> 
        </li>
    )
}

function PurchasePanel({ purchases, expandedPurchaseId }: { purchases: Purchase[]; expandedPurchaseId: number | null }) {
    const selectedPurchase = purchases.find((p) => p.id === expandedPurchaseId)
    if (selectedPurchase) {
        return (
            <section>
                <h2>Purchase Details</h2>
                <p><strong>Item Name:</strong> {selectedPurchase.itemName}</p>
                <p><strong>Item Category:</strong> {selectedPurchase.itemCategory}</p>
                <p><strong>Purchase Price:</strong> ${Number(selectedPurchase.purchasePrice).toFixed(2)}</p>
                <p><strong>Most Recent Price:</strong> ${Number(selectedPurchase.itemMostRecentPrice).toFixed(2)}</p>
                <p><strong>Chain Name:</strong> {selectedPurchase.chainName}</p>
                <p><strong>Store Address:</strong> {`${selectedPurchase.address.houseNumber} ${selectedPurchase.address.street}, ${selectedPurchase.address.city}, ${selectedPurchase.address.state} ${selectedPurchase.address.postCode}, ${selectedPurchase.address.country}`}</p>
                <p><strong>Purchase Date:</strong> {new Date(selectedPurchase.purchaseDate).toLocaleDateString()}</p>
            </section>
        )
    }
    return null;
}

export { PurchasesPanel, PurchasePanel }