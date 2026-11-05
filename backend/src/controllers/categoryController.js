
import {
    getAllCategories,
    getCategoryBySlug
} from "../models/categoryModel.js";

export const index = async (req, res) => {
    try {
        const categories = await getAllCategories();

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error("Category error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve categories"
        });
    }
};

export const show = async (req, res) => {
    try {
        const category = await getCategoryBySlug(req.params.slug);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error("Category error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve category"
        });
    }
};
