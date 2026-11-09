
import pool from "../config/database.js";

export const getAllProducts = async () => {
    const [rows] = await pool.query(`
        SELECT
            p.id,
            p.name,
            p.slug,
            p.description,
            p.price,
            p.compare_price,
            p.is_featured,
            c.name AS category_name,
            c.slug AS category_slug,
            (
                SELECT pi.image_path
                FROM product_images pi
                WHERE pi.product_id = p.id
                ORDER BY (pi.alt_text = 'After') DESC, pi.sort_order ASC, pi.id ASC
                LIMIT 1
            ) AS image,
            (
                SELECT pi.image_path
                FROM product_images pi
                WHERE pi.product_id = p.id AND pi.alt_text = 'Before'
                ORDER BY pi.sort_order ASC, pi.id ASC
                LIMIT 1
            ) AS before_image,
            (
                SELECT pi.image_path
                FROM product_images pi
                WHERE pi.product_id = p.id AND pi.alt_text = 'After'
                ORDER BY pi.sort_order ASC, pi.id ASC
                LIMIT 1
            ) AS after_image
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'published'
        ORDER BY p.created_at DESC
    `);

    return rows;
};

export const getProductBySlug = async (slug) => {
    const [rows] = await pool.execute(`
        SELECT
            p.id,
            p.name,
            p.slug,
            p.description,
            p.price,
            p.compare_price,
            p.is_featured,
            c.name AS category_name,
            c.slug AS category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = ? AND p.status = 'published'
        LIMIT 1
    `, [slug]);

    if (!rows.length) return null;

    const product = rows[0];

    const [images] = await pool.execute(`
        SELECT image_path, alt_text
        FROM product_images
        WHERE product_id = ?
        ORDER BY sort_order ASC, id ASC
    `, [product.id]);

    product.images = images;

    return product;
};
