
import pool from "../config/database.js";

export const getAllCategories = async () => {
    const [rows] = await pool.query(`
        SELECT
            id,
            name,
            slug,
            description
        FROM categories
        WHERE is_active = TRUE
        ORDER BY name ASC
    `);

    return rows;
};

export const getCategoryBySlug = async (slug) => {
    const [rows] = await pool.execute(`
        SELECT id, name, slug, description
        FROM categories
        WHERE slug = ? AND is_active = TRUE
        LIMIT 1
    `, [slug]);

    return rows[0] || null;
};
