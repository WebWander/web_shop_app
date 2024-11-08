import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';


function Cart() {
  const { authToken, incrementCartQuantity } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get('http://localhost:5000/cart', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setCartItems(response.data);
        calculateTotal(response.data);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    fetchCart();
  }, [authToken]);

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalPrice(total);
  };

  const updateQuantity = async (bookId, quantity) => {
    if (quantity < 1) return;
    try {
      await axios.post(
        'http://localhost:5000/update-cart-quantity',
        { bookId, quantity },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.bookId === bookId ? { ...item, quantity } : item
        )
      );
      calculateTotal(cartItems);
      incrementCartQuantity(cartItems.reduce((total, item) => total + item.quantity, 0));
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const removeItem = async (bookId) => {
    try {
      await axios.post(
        'http://localhost:5000/remove-from-cart',
        { bookId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      const updatedCartItems = cartItems.filter((item) => item.bookId !== bookId);
      setCartItems(updatedCartItems);
      calculateTotal(updatedCartItems);

      incrementCartQuantity(updatedCartItems.reduce((total, item) => total + item.quantity, 0));
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Your Shopping Cart</h2>
        <p>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
      </div>
      {cartItems.length > 0 ? (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.bookId} className="cart-item">
                <div className="cart-item-name">
                  {item.name}
                </div>
                <div className="cart-item-price">${item.price.toFixed(2)}</div>
                <div className="cart-item-quantity">
                  <label htmlFor={`quantity-${item.bookId}`}>Quantity:</label>
                  <select
                    id={`quantity-${item.bookId}`}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.bookId, parseInt(e.target.value))}
                  >
                    {[...Array(10).keys()].map((num) => (
                      <option key={num + 1} value={num + 1}>
                        {num + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="cart-item-subtotal">
                  ${((item.price * item.quantity).toFixed(2))}
                </div>
                <button onClick={() => removeItem(item.bookId)} className="remove-button">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Cart Summary</h3>
            <p>Total: ${totalPrice.toFixed(2)}</p>
            <button className="checkout-button">Proceed to Checkout</button>
          </div>
        </>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
}

export default Cart;