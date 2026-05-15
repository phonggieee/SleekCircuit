import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

import { app } from "./firebase_config.js";

const collectionName = "iPhones";

export async function fetchData() {
  const db = getFirestore(app);
  const querySnapshot = await getDocs(collection(db, collectionName));

  let products = [];
  querySnapshot.forEach((doc) => {
    products.push({ id: doc.id, ...doc.data() });
  });

  console.log(products);
  return products;
}

export async function renderProductData(id) {
  let productContainer = document.getElementById(id);
  let productHTML = "";
  let data = await fetchData();

  data.forEach((p) => {
    const pid = p.id ?? p.pk ?? p.name;
    const encodedPid = encodeURIComponent(pid);
    productHTML += `<a class="product-card" href="../pages/details.html?id=${encodedPid}" data-product-id="${encodedPid}">
                <img src="../assets/images/${p.image}" alt="${p.name}">
                <h2>${p.name}</h2>
                <p>${p.desc}</p>
                <span>Starting from $${p.price} (or $${(p.price / 12).toFixed(2)}/mo)</span>
                <button class="more">More</button>
            </a>`;
  });

  productContainer.innerHTML = productHTML;

  productContainer.querySelectorAll(".product-card").forEach((a) => {
    a.addEventListener("click", () => {
      const pid = a.getAttribute("data-product-id");
      if (pid) sessionStorage.setItem("selectedProductId", pid);
    });
  });
}

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

function isIndexPage() {
  const currentPage = window.location.pathname.split("/").pop();
  return currentPage === "index.html" || currentPage === "";
}

async function runSearchQuery(searchText) {
  const db = getFirestore(app);
  const q = query(
    collection(db, collectionName),
    where("name", ">=", searchText),
    where("name", "<=", searchText + "\uf8ff"),
  );
  const querySnapshot = await getDocs(q);

  let results = [];
  querySnapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });

  renderSearchedResults(results);
}

export async function renderSearchedResults(products) {
  let productContainer = document.getElementById("product-container");
  if (!productContainer) return;
  let productHTML = "";

  if (products.length === 0) {
    productContainer.innerHTML = "Product not found.";
    return;
  }

  products.forEach((p) => {
    const pid = p.id ?? p.pk ?? p.name;
    const encodedPid = encodeURIComponent(pid);
    productHTML += `<a class="product-card" href="../pages/details.html?id=${encodedPid}" data-product-id="${encodedPid}">
                <img src="../assets/images/${p.image}" alt="${p.name}">
                <h2>${p.name}</h2>
                <p>${p.desc}</p>
                <span>Starting from $${p.price} (or $${(p.price / 12).toFixed(2)}/mo)</span>
                <button class="more">More</button>
            </a>`;
  });

  productContainer.innerHTML = productHTML;

  productContainer.querySelectorAll(".product-card").forEach((a) => {
    a.addEventListener("click", () => {
      const pid = a.getAttribute("data-product-id");
      if (pid) sessionStorage.setItem("selectedProductId", pid);
    });
  });
}

async function searchProducts() {
  if (!searchInput) return;
  let searchText = searchInput.value.trim();
  if (searchText === "") return;

  if (!isIndexPage()) {
    window.location.href = `index.html?search=${encodeURIComponent(searchText)}`;
    return;
  }

  await runSearchQuery(searchText);
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set("search", searchText);
  window.history.replaceState({}, "", newUrl.toString());
}

export async function searchFromUrl() {
  if (!isIndexPage()) return;
  const urlParams = new URLSearchParams(window.location.search);
  const searchText = urlParams.get("search");
  if (searchText && searchInput) {
    searchInput.value = searchText;
    await runSearchQuery(searchText);
  }
}

if (searchBtn) {
  searchBtn.addEventListener("click", searchProducts);
}

if (searchInput) {
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchProducts();
    }
  });
}

export async function renderDetails(containerId) {
  const urlParams = new URLSearchParams(window.location.search);
  const productId =
    urlParams.get("id") || sessionStorage.getItem("selectedProductId");

  if (!productId) {
    console.error("No product ID found");
    return;
  }

  const products = await fetchData();
  const product = products.find(
    (p) => p.id === productId || p.pk === productId || p.name === productId,
  );

  if (!product) {
    console.error("Product not found");
    return;
  }

  const container = document.getElementById(containerId);
  const imageDiv = container.querySelector("#product-image");
  const infoDiv = container.querySelector("#product-info");

  imageDiv.innerHTML = `<img src="../assets/images/${product.image}" alt="${product.name}" />`;
  infoDiv.querySelector("#product-name").textContent = product.name;
  infoDiv.querySelector("#product-tagline").textContent = product.desc;
  infoDiv.querySelector("#product-price").textContent = `$${product.price}`;

  // Add event listener for add to cart button
  const cartButton = infoDiv.querySelector("#cart-button");
  cartButton.addEventListener("click", (e) => {
    e.preventDefault();
    import("./cart.js").then((module) => {
      module.addToCart(product.id);
    });
  });
}
