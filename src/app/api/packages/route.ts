import { NextResponse } from "next/server";
import { client } from "@/db";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schemeId = searchParams.get("schemeId");

    let sql = `
      SELECT pt.*, s.name as scheme_name, s.tamil_name as scheme_tamil_name, s.monthly_amount
      FROM package_templates pt
      LEFT JOIN schemes s ON pt.scheme_id = s.id
      WHERE pt.status = 'active'
    `;
    const args: any[] = [];
    if (schemeId) {
      sql += " AND pt.scheme_id = ?";
      args.push(schemeId);
    }
    sql += " ORDER BY pt.id ASC";

    const packagesRes = await client.execute({ sql, args });

    // For each package, fetch items
    const packagesWithItems = await Promise.all(
      packagesRes.rows.map(async (pkg: any) => {
        const itemsRes = await client.execute({
          sql: `SELECT pi.*, gp.name as product_name, gp.tamil_name as tamil_product_name, 
                       gp.unit, gp.unit_quantity, gp.stock_quantity
                FROM package_items pi
                JOIN grocery_products gp ON pi.product_id = gp.id
                WHERE pi.package_id = ?
                ORDER BY pi.id ASC`,
          args: [pkg.id],
        });
        return {
          ...pkg,
          items: itemsRes.rows,
        };
      })
    );

    return NextResponse.json({ packages: packagesWithItems });
  } catch (error: any) {
    console.error("Packages fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();

    const {
      name,
      tamilName,
      description,
      schemeId,
      items, // array of { productId, quantity, unitValue }
      bonusAmount = 0,
      discountAmount = 0,
    } = data;

    if (!name || !tamilName || !items || items.length === 0) {
      return NextResponse.json({ error: "Package name, Tamil name, and at least one item are required" }, { status: 400 });
    }

    let calculatedTotal = 0;
    for (const item of items) {
      calculatedTotal += Number(item.quantity) * Number(item.unitValue);
    }
    const netPackageValue = calculatedTotal - Number(discountAmount) + Number(bonusAmount);

    const pkgInsertRes = await client.execute({
      sql: `INSERT INTO package_templates 
            (name, tamil_name, description, scheme_id, total_package_value, discount_amount, bonus_amount, net_package_value, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      args: [
        name.trim(),
        tamilName.trim(),
        description || null,
        schemeId ? Number(schemeId) : null,
        calculatedTotal,
        Number(discountAmount),
        Number(bonusAmount),
        netPackageValue,
      ],
    });

    const newPkgId = Number(pkgInsertRes.lastInsertRowid);

    // Insert package items
    for (const it of items) {
      const itTotal = Number(it.quantity) * Number(it.unitValue);
      await client.execute({
        sql: `INSERT INTO package_items (package_id, product_id, quantity, unit_value, total_value)
              VALUES (?, ?, ?, ?, ?)`,
        args: [newPkgId, Number(it.productId), Number(it.quantity), Number(it.unitValue), itTotal],
      });
    }

    await logAudit({
      userId: user?.id,
      action: "CREATE_PACKAGE",
      entityType: "package",
      entityId: newPkgId,
      details: { name, netPackageValue, itemCount: items.length },
    });

    return NextResponse.json({
      success: true,
      packageId: newPkgId,
      message: "Package template created successfully",
    });
  } catch (error: any) {
    console.error("Package creation error:", error);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
