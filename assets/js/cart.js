import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { app } from "./firebase_config.js";
import { fetchData } from "./products.js";

const db = getFirestore(app);
const auth = getAuth();

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let userEmail = localStorage.getItem("cartUserEmail") || null;

onAuthStateChanged(auth, async (user) => {
  if (user?.email) {
    userEmail = user.email;
    localStorage.setItem("cartUserEmail", userEmail);
    await loadCartFromFirestore();
  }
});

async function getCartDocByEmail(email) {
  const cartsRef = collection(db, "carts");

  // Try with userEmail field first
  let cartsQuery = query(cartsRef, where("userEmail", "==", email));
  let querySnapshot = await getDocs(cartsQuery);

  let cartDocs = [];
  querySnapshot.forEach((docSnap) => {
    cartDocs.push({ id: docSnap.id, data: docSnap.data() });
  });

  // If no documents found with userEmail, try with email field (legacy)
  if (cartDocs.length === 0) {
    cartsQuery = query(cartsRef, where("email", "==", email));
    querySnapshot = await getDocs(cartsQuery);

    querySnapshot.forEach((docSnap) => {
      cartDocs.push({ id: docSnap.id, data: docSnap.data(), isLegacy: true });
    });
  }

  return cartDocs;
}

async function getNextCartDocId() {
  const cartsRef = collection(db, "carts");
  const querySnapshot = await getDocs(cartsRef);

  let maxId = 0;
  querySnapshot.forEach((docSnap) => {
    const numericId = parseInt(docSnap.id, 10);
    if (!isNaN(numericId) && numericId > maxId) {
      maxId = numericId;
    }
  });

  return String(maxId + 1);
}

async function saveProductToFirestore(product) {
  if (!userEmail) {
    return;
  }

  const cartDocs = await getCartDocByEmail(userEmail);
  const existingCartItem = cartDocs.find((doc) => doc.data.id === product.id);

  const productRecord = {
    id: product.id,
    image: product.image,
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    desc: product.desc,
    userEmail: userEmail,
  };

  if (existingCartItem) {
    await updateDoc(doc(db, "carts", existingCartItem.id), productRecord);
  } else {
    const nextId = await getNextCartDocId();
    await setDoc(doc(db, "carts", nextId), productRecord);
  }
}

async function loadCartFromFirestore() {
  if (!userEmail) {
    return;
  }

  const cartDocs = await getCartDocByEmail(userEmail);
  if (!cartDocs || cartDocs.length === 0) {
    return;
  }

  cart = [];

  cartDocs.forEach((doc) => {
    const data = doc.data;

    // Handle legacy structure with productList array
    if (data.productList && Array.isArray(data.productList)) {
      data.productList.forEach((item) => {
        cart.push({
          id: item.id,
          image: item.image,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          desc: item.desc,
          firestoreDocId: doc.id,
        });
      });
    } else {
      // Handle new structure with individual item document
      cart.push({
        id: data.id,
        image: data.image,
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        desc: data.desc,
        firestoreDocId: doc.id,
      });
    }
  });

  saveCart();
  renderCart();
}

export async function addToCart(productId) {
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
    saveCart();
    if (userEmail) {
      await saveProductToFirestore(existingItem);
    }
    alert("Updated item quantity in cart.");
    return;
  }

  const products = await fetchData();
  const prod = products.find(
    (p) => p.id === productId || p.pk === productId || p.name === productId,
  );
  if (!prod) {
    alert("Unable to add product to cart.");
    return;
  }

  const newCartItem = {
    id: prod.id,
    image: prod.image,
    name: prod.name,
    price: prod.price,
    quantity: 1,
    desc: prod.desc,
  };

  cart.push(newCartItem);
  saveCart();

  if (userEmail) {
    await saveProductToFirestore(newCartItem);
    alert("Added to cart and saved to your Firestore cart.");
  } else {
    alert("Added to cart locally. Sign in to save your cart.");
  }
}

export function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
}

export function updateQuantity(productId, quantity) {
  const product = cart.find((item) => item.id === productId);
  if (product) {
    product.quantity = quantity;
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      renderCart();
    }
  }
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  let total = 0;
  let html = "";

  if (!cart || cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    if (cartTotal) {
      cartTotal.textContent = "Total: $0.00";
    }
    return;
  }

  cart.forEach((item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    total += price * quantity;
    html += `
      <div class="cart-item">
        <img src="../assets/images/${item.image || "placeholder.png"}" alt="${item.name || "Product"}">
        <div class="cart-item-details">
          <h2>${item.name || "Unknown Product"}</h2>
          <p>${item.desc || ""}</p>
          <p>$${price.toFixed(2)}</p>
        </div>
        <div class="cart-item-quantity">
          <button onclick="updateQuantity('${item.id}', ${quantity - 1})">-</button>
          <span>${quantity}</span>
          <button onclick="updateQuantity('${item.id}', ${quantity + 1})">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">Remove</button>
      </div>
    `;
  });

  cartItems.innerHTML = html;
  if (cartTotal) {
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  }
}

// Make functions global for onclick
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;

// Render cart on load
document.addEventListener("DOMContentLoaded", renderCart);
