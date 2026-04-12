const { CART_LIMITS } = require('./utils/constants');
const { validateItem, roundToTwo } = require('./utils/validators');

class ShoppingCart {
  constructor() {
    this.items = [];
    this.appliedCoupon = null;
  }

  /**
   * Adds an item to the cart. If the item already exists (by name),
   * the quantity gets updated instead of adding a duplicate.
   */
  addItem(name, price, quantity = 1, category = null) {
    validateItem(name, price, quantity, category);

    // check cart capacity
    const currentTotal = this.getTotalItemCount();
    if (currentTotal + quantity > CART_LIMITS.MAX_ITEMS) {
      throw new Error(`Cannot add ${quantity} items. Cart limit is ${CART_LIMITS.MAX_ITEMS} (currently ${currentTotal})`);
    }

    // check if item already in cart
    const existingItem = this.items.find(item => item.name === name);
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > CART_LIMITS.MAX_QUANTITY_PER_ITEM) {
        throw new Error(`Total quantity for "${name}" would exceed the limit of ${CART_LIMITS.MAX_QUANTITY_PER_ITEM}`);
      }
      existingItem.quantity = newQuantity;
      existingItem.price = price; // update price in case it changed
      return existingItem;
    }

    const newItem = {
      name: name.trim(),
      price: roundToTwo(price),
      quantity,
      category
    };

    this.items.push(newItem);
    return newItem;
  }

  /**
   * Removes an item from the cart by name.
   * Returns the removed item, or throws if not found.
   */
  removeItem(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Item name must be a non-empty string');
    }

    const index = this.items.findIndex(item => item.name === name);
    if (index === -1) {
      throw new Error(`Item "${name}" not found in cart`);
    }

    const removed = this.items.splice(index, 1)[0];
    return removed;
  }

  /**
   * Updates the quantity of an existing item.
   * If quantity is set to 0, the item gets removed.
   */
  updateQuantity(name, newQuantity) {
    if (!name || typeof name !== 'string') {
      throw new Error('Item name must be a non-empty string');
    }

    if (typeof newQuantity !== 'number' || !Number.isInteger(newQuantity)) {
      throw new Error('Quantity must be an integer');
    }

    if (newQuantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const item = this.items.find(item => item.name === name);
    if (!item) {
      throw new Error(`Item "${name}" not found in cart`);
    }

    if (newQuantity === 0) {
      return this.removeItem(name);
    }

    if (newQuantity > CART_LIMITS.MAX_QUANTITY_PER_ITEM) {
      throw new Error(`Quantity cannot exceed ${CART_LIMITS.MAX_QUANTITY_PER_ITEM} per item`);
    }

    // need to check total cart limit too
    const otherItemsCount = this.getTotalItemCount() - item.quantity;
    if (otherItemsCount + newQuantity > CART_LIMITS.MAX_ITEMS) {
      throw new Error(`Updating quantity would exceed cart limit of ${CART_LIMITS.MAX_ITEMS}`);
    }

    item.quantity = newQuantity;
    return item;
  }

  /**
   * Returns the item object if found, null otherwise
   */
  getItem(name) {
    return this.items.find(item => item.name === name) || null;
  }

  /**
   * Total number of items in cart (sum of all quantities)
   */
  getTotalItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Number of distinct products in cart
   */
  getUniqueItemCount() {
    return this.items.length;
  }

  /**
   * Calculate the subtotal before discounts and tax
   */
  getSubtotal() {
    const subtotal = this.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    return roundToTwo(subtotal);
  }

  /**
   * Checks whether the cart has no items
   */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Removes all items and resets the applied coupon
   */
  clear() {
    this.items = [];
    this.appliedCoupon = null;
  }

  /**
   * Stores a coupon code on the cart. Actual validation
   * and discount application happens in PricingEngine.
   */
  setCoupon(couponCode) {
    if (!couponCode || typeof couponCode !== 'string') {
      throw new Error('Coupon code must be a non-empty string');
    }
    this.appliedCoupon = couponCode.trim().toUpperCase();
  }

  /**
   * Removes the applied coupon
   */
  removeCoupon() {
    this.appliedCoupon = null;
  }

  /**
   * Returns a sorted copy of items by a given field.
   * Useful for displaying cart contents.
   */
  getItemsSortedBy(field = 'name', ascending = true) {
    const validFields = ['name', 'price', 'quantity', 'category'];
    if (!validFields.includes(field)) {
      throw new Error(`Invalid sort field. Use one of: ${validFields.join(', ')}`);
    }

    const sorted = [...this.items].sort((a, b) => {
      if (typeof a[field] === 'string') {
        return ascending
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      }
      return ascending ? a[field] - b[field] : b[field] - a[field];
    });

    return sorted;
  }

  /**
   * Returns the most expensive item in the cart.
   * If cart is empty returns null.
   */
  getMostExpensiveItem() {
    if (this.isEmpty()) return null;

    return this.items.reduce((max, item) => {
      return (item.price > max.price) ? item : max;
    }, this.items[0]);
  }

  /**
   * Returns the cheapest item in the cart.
   */
  getCheapestItem() {
    if (this.isEmpty()) return null;

    return this.items.reduce((min, item) => {
      return (item.price < min.price) ? item : min;
    }, this.items[0]);
  }

  /**
   * Returns a plain object summary of the cart state
   */
  getSummary() {
    return {
      items: this.items.map(item => ({ ...item })),
      uniqueItems: this.getUniqueItemCount(),
      totalItems: this.getTotalItemCount(),
      subtotal: this.getSubtotal(),
      coupon: this.appliedCoupon
    };
  }
}

module.exports = ShoppingCart;
