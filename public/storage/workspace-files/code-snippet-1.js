function calculateTotal(items) {
  return items.reduce((total, item) => total + item.price, 0)
}

const cart = [
  { id: 1, name: 'Item 1', price: 10 },
  { id: 2, name: 'Item 2', price: 20 }
]

console.log('Total:', calculateTotal(cart))