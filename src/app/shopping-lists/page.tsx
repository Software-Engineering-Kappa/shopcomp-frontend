"use client"
import styles from "./page.module.css"
import React from "react"
import { ShoppingListSearch, CreateShoppingListForm } from "./boundary"
import Header from "../header"


export default function ShoppingListsPage() {
  return (
    <div>
      <Header />
      <main>
        <h1>Shopping Lists</h1>
        <ShoppingListSearch />

      </main>
    </div>
  )
}


