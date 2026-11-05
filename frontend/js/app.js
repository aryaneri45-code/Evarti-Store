
const API_URL = "http://localhost:3000/api";

const productList = document.getElementById("product-list");

function formatPrice(price) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(price);
}

function renderProducts(products) {
    if (!products.length) {
        productList.innerHTML = `
            <div class="loading">
                Our products are coming soon.
            </div>
        `;
        return;
    }

    productList.innerHTML = products.map(product => `
        <article class="product-card">
            <img
                src="${product.image || "assets/images/placeholder.jpg"}"
                alt="${product.name}"
                loading="lazy"
            >

            <div class="product-info">
                <h3>${product.name}</h3>

                <div class="product-price">
                    ${formatPrice(product.price)}
                </div>

                <a href="product-detail.html?slug=${encodeURIComponent(product.slug)}">
                    View Product →
                </a>
            </div>
        </article>
    `).join("");
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        const result = await response.json();

        renderProducts(result.data || []);

    } catch (error) {
        console.error("Product loading error:", error);

        productList.innerHTML = `
            <div class="loading">
                Unable to load products. Please try again later.
            </div>
        `;
    }
}

loadProducts();
