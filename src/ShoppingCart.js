const { CART_LIMITS } = require('./utils/constants');
const { validateItem, roundToTwo } = require('./utils/validators');
class ShoppingCart {
  constructor() { this.items = []; this.appliedCoupon = null; }
  addItem(name, price, quantity = 1, category = null) {
    validateItem(name, price, quantity, category);
    const currentTotal = this.getTotalItemCount();
    if (currentTotal + quantity > CART_LIMITS.MAX_ITEMS) throw new Error(`Cannot add ${quantity} items. Cart limit is ${CART_LIMITS.MAX_ITEMS} (currently ${currentTotal})`);
    const existingItem = this.items.find(item => item.name === name);
    if (existingItem) { const newQuantity = existingItem.quantity + quantity; if (newQuantity > CART_LIMITS.MAX_QUANTITY_PER_ITEM) throw new Error(`Total quantity for "${name}" would exceed the limit of ${CART_LIMITS.MAX_QUANTITY_PER_ITEM}`); existingItem.quantity = newQuantity; existingItem.price = price; return existingItem; }
    const newItem = { name: name.trim(), price: roundToTwo(price), quantity, category }; this.items.push(newItem); return newItem;
  }
  removeItem(name) { if (!name || typeof name !== 'string') throw new Error('Item name must be a non-empty string'); const index = this.items.findIndex(item => item.name === name); if (index === -1) throw new Error(`Item "${name}" not found in cart`); return this.items.splice(index, 1)[0]; }
  updateQuantity(name, newQuantity) { if (!name || typeof name !== 'string') throw new Error('Item name must be a non-empty string'); if (typeof newQuantity !== 'number' || !Number.isInteger(newQuantity)) throw new Error('Quantity must be an integer'); if (newQuantity < 0) throw new Error('Quantity cannot be negative'); const item = this.items.find(item => item.name === name); if (!item) throw new Error(`Item "${name}" not found in cart`); if (newQuantity === 0) return this.removeItem(name); if (newQuantity > CART_LIMITS.MAX_QUANTITY_PER_ITEM) throw new Error(`Quantity cannot exceed ${CART_LIMITS.MAX_QUANTITY_PER_ITEM} per item`); const otherItemsCount = this.getTotalItemCount() - item.quantity; if (otherItemsCount + newQuantity > CART_LIMITS.MAX_ITEMS) throw new Error(`Updating quantity would exceed cart limit of ${CART_LIMITS.MAX_ITEMS}`); item.quantity = newQuantity; return item; }
  getItem(name) { return this.items.find(item => item.name === name) || null; }
  getTotalItemCount() { return this.items.reduce((sum, item) => sum + item.quantity, 0); }
  getUniqueItemCount() { return this.items.length; }
  getSubtotal() { return roundToTwo(this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)); }
  isEmpty() { return this.items.length === 0; }
  clear() { this.items = []; this.appliedCoupon = null; }
  setCoupon(couponCode) { if (!couponCode || typeof couponCode !== 'string') throw new Error('Coupon code must be a non-empty string'); this.appliedCoupon = couponCode.trim().toUpperCase(); }
  removeCoupon() { this.appliedCoupon = null; }
  getSummary() { return { items: this.items.map(item => ({ ...item })), uniqueItems: this.getUniqueItemCount(), totalItems: this.getTotalItemCount(), subtotal: this.getSubtotal(), coupon: this.appliedCoupon }; }
}
module.exports = ShoppingCart;
