/**
 * item.types.ts - TypeScript type definitions for Item
 *
 * TypeScript INTERFACES define the "shape" of our data.
 * Think of them like blueprints or contracts.
 *
 * Similar to Kotlin data classes, but TypeScript interfaces:
 * - Don't have any runtime code (compiled away)
 * - Just for type checking during development
 * - Help catch bugs before running the app
 *
 * Why use interfaces?
 * 1. Autocomplete in VS Code - knows what properties exist
 * 2. Type safety - can't misspell property names
 * 3. Documentation - clearly shows what data looks like
 */

/**
 * Item - Represents a physical item the user wants to remember
 *
 * This matches the Android Item data class exactly!
 */
export interface Item {
  /**
   * Unique identifier for this item
   */
  id: string;

  /**
   * The name of the item (e.g., "Car Keys", "Wallet", "Phone")
   */
  name: string;

  /**
   * Optional description with more details
   * The "?" means this property is optional (can be undefined)
   */
  description?: string;

  /**
   * When this item was added (timestamp in milliseconds)
   */
  createdAt: number;

  /**
   * URL or path to the item's image
   */
  imageUrl?: string;

  /**
   * Tags/labels for the item (e.g., ["important", "daily-use"])
   * Array means it can have multiple labels
   */
  labels: string[];
}

/**
 * EXAMPLE OF HOW TO CREATE AN ITEM:
 *
 * const myKeys: Item = {
 *   id: "1",
 *   name: "Car Keys",
 *   description: "Toyota keys with red keychain",
 *   createdAt: Date.now(),
 *   labels: ["important", "daily"]
 * };
 *
 * EXAMPLE OF TYPE SAFETY:
 *
 * // ✅ This works:
 * console.log(myKeys.name);  // "Car Keys"
 *
 * // ❌ This gives an error:
 * console.log(myKeys.color);  // ERROR: Property 'color' does not exist on type 'Item'
 *
 * TypeScript prevents you from accessing properties that don't exist!
 */
