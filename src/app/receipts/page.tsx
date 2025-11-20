"use client"

import styles from "./page.module.css"
import React from "react"
import { SearchBar } from "./boundary"


export default function ReceiptsPage() {
    
    return (
        <div>
            <main>
                <h1>Receipts</h1>
                <SearchBar/>
                <button className="create-receipt">Create Receipt</button>
            </main>
        </div>
    )
}