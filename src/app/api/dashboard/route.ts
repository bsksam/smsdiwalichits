import { NextResponse } from "next/server";
import { client } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const currentMonth = today.slice(0, 7); // e.g. '2026-11'

    // 1. Total Customers
    const totalCustomersRes = await client.execute("SELECT COUNT(*) as count FROM customers WHERE status != 'blocked'");
    const totalCustomers = Number(totalCustomersRes.rows[0]?.count || 0);

    // 2. Active Members
    const activeMembersRes = await client.execute("SELECT COUNT(*) as count FROM scheme_members WHERE status = 'active'");
    const activeMembers = Number(activeMembersRes.rows[0]?.count || 0);

    // 3. Running Schemes
    const runningSchemesRes = await client.execute("SELECT COUNT(*) as count FROM schemes WHERE status = 'active'");
    const runningSchemes = Number(runningSchemesRes.rows[0]?.count || 0);

    // 4. Today's Collection
    const todayCollRes = await client.execute({
      sql: "SELECT COALESCE(SUM(total_amount), 0) as total FROM payments WHERE payment_date = ? AND status = 'completed'",
      args: [today],
    });
    const todayCollection = Number(todayCollRes.rows[0]?.total || 0);

    // 5. Monthly Collection (Current Month)
    const monthCollRes = await client.execute({
      sql: "SELECT COALESCE(SUM(total_amount), 0) as total FROM payments WHERE payment_date LIKE ? AND status = 'completed'",
      args: [`${currentMonth}%`],
    });
    const monthlyCollection = Number(monthCollRes.rows[0]?.total || 0);

    // Total Lifetime Collection
    const totalCollRes = await client.execute("SELECT COALESCE(SUM(total_amount), 0) as total FROM payments WHERE status = 'completed'");
    const totalLifetimeCollection = Number(totalCollRes.rows[0]?.total || 0);

    // 6. Pending Payments
    const pendingRes = await client.execute("SELECT COALESCE(SUM(amount - paid_amount), 0) as total, COUNT(*) as count FROM installments WHERE status IN ('pending', 'partial', 'overdue')");
    const pendingAmount = Number(pendingRes.rows[0]?.total || 0);
    const pendingCount = Number(pendingRes.rows[0]?.count || 0);

    // 7. Overdue Payments
    const overdueRes = await client.execute({
      sql: "SELECT COALESCE(SUM(amount - paid_amount), 0) as total, COUNT(*) as count FROM installments WHERE status = 'overdue' OR (status = 'pending' AND due_date < ?)",
      args: [today],
    });
    const overdueAmount = Number(overdueRes.rows[0]?.total || 0);
    const overdueCount = Number(overdueRes.rows[0]?.count || 0);

    // 8. Completed Schemes
    const completedSchemesRes = await client.execute("SELECT COUNT(*) as count FROM scheme_members WHERE completed_installments >= 12 OR status = 'completed'");
    const completedSchemes = Number(completedSchemesRes.rows[0]?.count || 0);

    // 9. Upcoming Maturity (within next 60 days)
    const upcomingMaturityRes = await client.execute("SELECT COUNT(*) as count FROM scheme_members WHERE completed_installments >= 10 AND status = 'active'");
    const upcomingMaturity = Number(upcomingMaturityRes.rows[0]?.count || 0);

    // 10. Total Grocery Stock Value
    const stockValRes = await client.execute("SELECT COALESCE(SUM(stock_quantity * selling_price), 0) as total FROM grocery_products WHERE status = 'active'");
    const groceryStockValue = Number(stockValRes.rows[0]?.total || 0);

    // Monthly Collection Chart (Last 6-12 months breakdown)
    const monthlyTrendRes = await client.execute(`
      SELECT SUBSTR(payment_date, 1, 7) as month, SUM(total_amount) as amount 
      FROM payments 
      WHERE status = 'completed'
      GROUP BY SUBSTR(payment_date, 1, 7) 
      ORDER BY month ASC 
      LIMIT 12
    `);
    const monthlyCollectionChart = monthlyTrendRes.rows.map((r: any) => ({
      month: r.month,
      amount: Number(r.amount),
    }));

    // Scheme-wise Collection Chart
    const schemeCollRes = await client.execute(`
      SELECT s.name, s.tamil_name as tamilName, COALESCE(SUM(p.total_amount), 0) as totalAmount
      FROM schemes s
      LEFT JOIN payments p ON s.id = p.scheme_id AND p.status = 'completed'
      GROUP BY s.id
    `);
    const schemeCollectionChart = schemeCollRes.rows.map((r: any) => ({
      name: r.name,
      tamilName: r.tamilName,
      amount: Number(r.totalAmount),
    }));

    // Recent Payments (Today / Recent 10)
    const recentPaymentsRes = await client.execute(`
      SELECT p.id, p.receipt_number as receiptNumber, p.amount, p.payment_mode as paymentMode, 
             p.payment_date as paymentDate, p.status, c.full_name as customerName, c.mobile, 
             s.name as schemeName, p.installment_number as installmentNumber
      FROM payments p
      JOIN customers c ON p.customer_id = c.id
      JOIN schemes s ON p.scheme_id = s.id
      ORDER BY p.id DESC
      LIMIT 8
    `);

    // Recent Customer Registrations
    const recentCustomersRes = await client.execute(`
      SELECT id, customer_code as customerCode, full_name as fullName, mobile, city, registration_date as registrationDate, status
      FROM customers
      ORDER BY id DESC
      LIMIT 6
    `);

    // Upcoming Installment Reminders
    const upcomingRemindersRes = await client.execute(`
      SELECT i.id, i.installment_number as installmentNumber, i.due_date as dueDate, i.amount, 
             c.full_name as customerName, c.mobile, s.name as schemeName
      FROM installments i
      JOIN customers c ON i.customer_id = c.id
      JOIN schemes s ON i.scheme_id = s.id
      WHERE i.status IN ('pending', 'overdue')
      ORDER BY i.due_date ASC
      LIMIT 6
    `);

    // Recent Audit Activities
    const recentActivitiesRes = await client.execute(`
      SELECT a.id, a.action, a.entity_type as entityType, a.created_at as createdAt, 
             u.full_name as userName
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.id DESC
      LIMIT 6
    `);

    // Collection performance calculation: percentage of current month collected vs target
    const targetMonthly = (activeMembers || 1) * 1000;
    const collectionProgress = Math.min(100, Math.round((monthlyCollection / (targetMonthly || 1)) * 100));

    return NextResponse.json({
      metrics: {
        totalCustomers,
        activeMembers,
        runningSchemes,
        todayCollection,
        monthlyCollection,
        totalLifetimeCollection,
        pendingAmount,
        pendingCount,
        overdueAmount,
        overdueCount,
        completedSchemes,
        upcomingMaturity,
        groceryStockValue,
        collectionProgress,
      },
      charts: {
        monthlyCollectionChart,
        schemeCollectionChart,
      },
      recentPayments: recentPaymentsRes.rows,
      recentCustomers: recentCustomersRes.rows,
      upcomingReminders: upcomingRemindersRes.rows,
      recentActivities: recentActivitiesRes.rows,
    });
  } catch (error: any) {
    console.error("Dashboard data fetch error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
