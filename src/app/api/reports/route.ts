import { NextResponse } from "next/server";
import { client } from "@/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type") || "daily_collection";
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const schemeId = searchParams.get("schemeId");
    const staffId = searchParams.get("staffId");

    let reportData: any = {};

    switch (reportType) {
      case "daily_collection": {
        const targetDate = fromDate || new Date().toISOString().split("T")[0];
        const res = await client.execute({
          sql: `SELECT p.*, c.full_name as customer_name, c.mobile, s.name as scheme_name, u.full_name as collected_by
                FROM payments p
                JOIN customers c ON p.customer_id = c.id
                JOIN schemes s ON p.scheme_id = s.id
                LEFT JOIN users u ON p.collected_by_user_id = u.id
                WHERE p.payment_date = ? AND p.status = 'completed'
                ORDER BY p.id DESC`,
          args: [targetDate],
        });
        const total = res.rows.reduce((sum: number, r: any) => sum + Number(r.total_amount), 0);
        reportData = { rows: res.rows, total, date: targetDate };
        break;
      }

      case "monthly_collection": {
        const monthPrefix = fromDate ? fromDate.slice(0, 7) : new Date().toISOString().slice(0, 7);
        const res = await client.execute({
          sql: `SELECT SUBSTR(payment_date, 1, 10) as date, COUNT(*) as count, SUM(total_amount) as amount
                FROM payments
                WHERE payment_date LIKE ? AND status = 'completed'
                GROUP BY date
                ORDER BY date ASC`,
          args: [`${monthPrefix}%`],
        });
        const total = res.rows.reduce((sum: number, r: any) => sum + Number(r.amount), 0);
        reportData = { rows: res.rows, total, month: monthPrefix };
        break;
      }

      case "scheme_wise": {
        const res = await client.execute(`
          SELECT s.id, s.name, s.tamil_name, s.monthly_amount, s.grocery_package_value,
                 COUNT(DISTINCT sm.id) as enrolled_count,
                 COALESCE(SUM(p.total_amount), 0) as total_collected,
                 COUNT(DISTINCT r.id) as redeemed_count
          FROM schemes s
          LEFT JOIN scheme_members sm ON s.id = sm.scheme_id
          LEFT JOIN payments p ON s.id = p.scheme_id AND p.status = 'completed'
          LEFT JOIN redemptions r ON s.id = r.scheme_id
          GROUP BY s.id
        `);
        reportData = { rows: res.rows };
        break;
      }

      case "pending_installments": {
        let sql = `
          SELECT i.*, c.full_name as customer_name, c.mobile, c.customer_code, s.name as scheme_name, sm.passbook_number
          FROM installments i
          JOIN customers c ON i.customer_id = c.id
          JOIN schemes s ON i.scheme_id = s.id
          JOIN scheme_members sm ON i.member_id = sm.id
          WHERE i.status IN ('pending', 'overdue')
        `;
        const args: any[] = [];
        if (schemeId) {
          sql += " AND i.scheme_id = ?";
          args.push(schemeId);
        }
        sql += " ORDER BY i.due_date ASC";
        const res = await client.execute({ sql, args });
        const totalPending = res.rows.reduce((sum: number, r: any) => sum + Number(r.amount), 0);
        reportData = { rows: res.rows, totalPending };
        break;
      }

      case "overdue": {
        const today = new Date().toISOString().split("T")[0];
        const res = await client.execute({
          sql: `SELECT i.*, c.full_name as customer_name, c.mobile, c.customer_code, s.name as scheme_name, sm.passbook_number
                FROM installments i
                JOIN customers c ON i.customer_id = c.id
                JOIN schemes s ON i.scheme_id = s.id
                JOIN scheme_members sm ON i.member_id = sm.id
                WHERE (i.status = 'overdue' OR (i.status = 'pending' AND i.due_date < ?))
                ORDER BY i.due_date ASC`,
          args: [today],
        });
        const totalOverdue = res.rows.reduce((sum: number, r: any) => sum + Number(r.amount), 0);
        reportData = { rows: res.rows, totalOverdue };
        break;
      }

      case "redemptions": {
        const res = await client.execute(`
          SELECT r.*, c.full_name as customer_name, c.mobile, c.customer_code, s.name as scheme_name, sm.passbook_number,
                 pt.name as package_name, u.full_name as issued_by
          FROM redemptions r
          JOIN customers c ON r.customer_id = c.id
          JOIN schemes s ON r.scheme_id = s.id
          JOIN scheme_members sm ON r.member_id = sm.id
          LEFT JOIN package_templates pt ON r.package_id = pt.id
          LEFT JOIN users u ON r.issued_by_user_id = u.id
          ORDER BY r.id DESC
        `);
        const totalValue = res.rows.reduce((sum: number, r: any) => sum + Number(r.total_package_value), 0);
        reportData = { rows: res.rows, totalValue };
        break;
      }

      case "stock": {
        const res = await client.execute(`
          SELECT p.*, c.name as category_name, (p.stock_quantity * p.selling_price) as total_val
          FROM grocery_products p
          LEFT JOIN grocery_categories c ON p.category_id = c.id
          ORDER BY p.stock_quantity ASC
        `);
        const totalStockVal = res.rows.reduce((sum: number, r: any) => sum + Number(r.total_val), 0);
        reportData = { rows: res.rows, totalStockVal };
        break;
      }

      case "profit_loss": {
        // Total Collections (Income)
        const incRes = await client.execute("SELECT COALESCE(SUM(total_amount), 0) as total FROM payments WHERE status = 'completed'");
        const totalIncome = Number(incRes.rows[0]?.total || 0);

        // Total Expenses
        const expRes = await client.execute("SELECT COALESCE(SUM(amount), 0) as total FROM expenses");
        const totalExpense = Number(expRes.rows[0]?.total || 0);

        // Total Grocery Package Costs (purchase cost of goods redeemed or estimated)
        const redValRes = await client.execute("SELECT COALESCE(SUM(total_package_value), 0) as total FROM redemptions WHERE status = 'issued'");
        const totalRedemptions = Number(redValRes.rows[0]?.total || 0);

        const netProfit = totalIncome - totalExpense;

        reportData = {
          totalIncome,
          totalExpense,
          totalRedemptions,
          netProfit,
        };
        break;
      }

      case "staff_collection": {
        const res = await client.execute(`
          SELECT u.id, u.full_name, u.username, u.role,
                 COUNT(p.id) as total_receipts,
                 COALESCE(SUM(p.total_amount), 0) as total_collected
          FROM users u
          LEFT JOIN payments p ON u.id = p.collected_by_user_id AND p.status = 'completed'
          GROUP BY u.id
          ORDER BY total_collected DESC
        `);
        reportData = { rows: res.rows };
        break;
      }

      default:
        reportData = { error: "Unknown report type" };
    }

    return NextResponse.json({ reportType, ...reportData });
  } catch (error: any) {
    console.error("Report generation error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
