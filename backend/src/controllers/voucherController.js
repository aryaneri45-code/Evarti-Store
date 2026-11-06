import pool from "../config/database.js";

const COUPON_CODE = "TANADA";
const DISCOUNT_PERCENT = 10;

export const validate = async (req, res) => {
    const code = typeof req.body?.code === "string" ? req.body.code.trim().toUpperCase() : "";
    const items = req.body?.items;

    if (!code || !Array.isArray(items) || items.length === 0 || items.length > 50) {
        return res.status(400).json({ success: false, valid: false, message: "Coupon code and cart items are required" });
    }

    const slugs = [];
    for (const item of items) {
        if (!item || typeof item.slug !== "string" || item.slug.length > 220 || (item.quantity !== undefined && item.quantity !== 1)) {
            return res.status(400).json({ success: false, valid: false, message: "Invalid cart items" });
        }
        slugs.push(item.slug);
    }

    if (new Set(slugs).size !== slugs.length) {
        return res.status(400).json({ success: false, valid: false, message: "A product may only appear once per order" });
    }

    if (code !== COUPON_CODE) {
        return res.status(200).json({ success: true, valid: false, message: "Coupon code is invalid" });
    }

    try {
        const [products] = await pool.query(
            "SELECT slug, price FROM products WHERE status = 'published' AND slug IN (?)",
            [slugs]
        );

        if (products.length !== slugs.length) {
            return res.status(400).json({ success: false, valid: false, message: "One or more products are unavailable" });
        }

        const subtotal = products.reduce((sum, product) => sum + Number(product.price), 0);
        const discount = Math.round(subtotal * DISCOUNT_PERCENT / 100);

        return res.json({
            success: true,
            valid: true,
            code: COUPON_CODE,
            discount_percent: DISCOUNT_PERCENT,
            subtotal,
            discount,
            total: subtotal - discount
        });
    } catch (error) {
        console.error("Voucher error:", error.message);
        return res.status(500).json({ success: false, valid: false, message: "Failed to validate coupon" });
    }
};
