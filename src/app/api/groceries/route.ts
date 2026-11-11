import { NextResponse } from "next/server";
import { client } from "@/db";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const lowStockOnly = searchParams.get("lowStock") === "true";

    let sql = `
      SELECT p.*, c.name as category_name, c.tamil_name as category_tamil_name,
        CASE WHEN p.stock_quantity <= p.min_stock_alert THEN 1 ELSE 0 END as is_low_stock
      FROM grocery_products p
      LEFT JOIN grocery_categories c ON p.category_id = c.id
      WHERE p.status = 'active'
    `;
    const args: any[] = [];

    if (search) {
      sql += " AND (p.name LIKE ? OR p.tamil_name LIKE ? OR p.code LIKE ? OR p.barcode LIKE ?)";
      const term = `%${search}%`;
      args.push(term, term, term, term);
    }
    if (categoryId) {
      sql += " AND p.category_id = ?";
      args.push(categoryId);
    }
    if (lowStockOnly) {
      sql += " AND p.stock_quantity <= p.min_stock_alert";
    }

    sql += " ORDER BY p.id ASC";

    const productsRes = await client.execute({ sql, args });
    const categoriesRes = await client.execute("SELECT * FROM grocery_categories ORDER BY id ASC");

    return NextResponse.json({
      products: productsRes.rows,
      categories: categoriesRes.rows,
    });
  } catch (error: any) {
    console.error("Groceries fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch groceries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();

    const {
      name,
      tamilName,
      categoryId,
      brand,
      unit,
      unitQuantity,
      purchasePrice = 0,
      sellingPrice,
      stockQuantity = 0,
      minStockAlert = 10,
      barcode,
      imageUrl,
    } = data;

    if (!name || !tamilName || !sellingPrice || !unitQuantity) {
      return NextResponse.json({ error: "Product Name, Tamil Name, Unit Quantity, and Selling Price are required" }, { status: 400 });
    }

    const countRes = await client.execute("SELECT COUNT(*) as count FROM grocery_products");
    const nextSeq = Number(countRes.rows[0]?.count || 0) + 1;
    const code = `GRC-${String(nextSeq).padStart(3, "0")}`;

    const insertRes = await client.execute({
      sql: `INSERT INTO grocery_products 
            (code, name, tamil_name, category_id, brand, unit, unit_quantity, purchase_price, selling_price, stock_quantity, min_stock_alert, barcode, image_url, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      args: [
        code,
        name.trim(),
        tamilName.trim(),
        categoryId || 1,
        brand || "Lakshmi Supermarket",
        unit || "kg",
        unitQuantity.trim(),
        Number(purchasePrice),
        Number(sellingPrice),
        Number(stockQuantity),
        Number(minStockAlert),
        barcode || code,
        imageUrl || null,
      ],
    });

    const newProdId = Number(insertRes.lastInsertRowid);

    // Initial stock transaction
    if (Number(stockQuantity) > 0) {
      await client.execute({
        sql: `INSERT INTO stock_transactions 
              (product_id, transaction_type, quantity_change, previous_stock, new_stock, reference_type, notes, created_by_user_id)
              VALUES (?, 'purchase', ?, 0, ?, 'initial_setup', 'Initial stock entry', ?)`,
        args: [newProdId, Number(stockQuantity), Number(stockQuantity), user?.id || 1],
      });
    }

    await logAudit({
      userId: user?.id,
      action: "CREATE_GROCERY_PRODUCT",
      entityType: "product",
      entityId: newProdId,
      details: { code, name, sellingPrice, stockQuantity },
    });

    return NextResponse.json({
      success: true,
      productId: newProdId,
      message: "Product added successfully",
    });
  } catch (error: any) {
    console.error("Product creation error:", error);
    return NextResponse.json({ error: "Failed to create grocery product" }, { status: 500 });
  }
}
