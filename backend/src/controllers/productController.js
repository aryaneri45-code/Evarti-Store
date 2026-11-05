
import {
    getAllProducts,
    getProductBySlug
} from "../models/productModel.js";

export const index = async (req, res) => {
    try {
        const products = await getAllProducts();

        res.json({
            success: true,
            total: products.length,
            data: products
        });
    } catch (error) {
        console.error("Product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve products"
        });
    }
};

export const show = async (req, res) => {
    try {
        const product = await getProductBySlug(req.params.slug);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error("Product error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve product"
        });
    }
};
