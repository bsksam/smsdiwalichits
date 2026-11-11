import { NextResponse } from "next/server";
import { client } from "@/db";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const month = searchParams.get("month"); // e.g. '2026-02'

    let sql = `
      SELECT e.*, ec.name as category_name, u.full_name as approved_by_name
      FROM expenses e
      JOIN expense_categories ec ON e.category_id = ec.id
      LEFT JOIN users u ON e.approved_by_user_id = u.id
      WHERE 1=1
    `;
    const args: any[] = [];

    if (categoryId) {
      sql += " AND e.category_id = ?";
      args.push(categoryId);
    }
    if (month) {
      sql += " AND e.expense_date LIKE ?";
      args.push(`${month}%`);
    }

    sql += " ORDER BY e.expense_date DESC, e.id DESC";

    const expensesRes = await client.execute({ sql, args });
    const categoriesRes = await client.execute("SELECT * FROM expense_categories ORDER BY id ASC");

    // Cash Book summary: Total Income (payments) vs Total Expenses
    const incomeRes = await client.execute("SELECT COALESCE(SUM(total_amount), 0) as total FROM payments WHERE status = 'completed'");
    const totalIncome = Number(incomeRes.rows[0]?.total || 0);

    const expenseTotalRes = await client.execute("SELECT COALESCE(SUM(amount), 0) as total FROM expenses");
    const totalExpense = Number(expenseTotalRes.rows[0]?.total || 0);

    const netCashBalance = totalIncome - totalExpense;

    return NextResponse.json({
      expenses: expensesRes.rows,
      categories: categoriesRes.rows,
      summary: {
        totalIncome,
        totalExpense,
        netCashBalance,
      },
    });
  } catch (error: any) {
    console.error("Expenses fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();

    const {
      categoryId,
      amount,
      expenseDate,
      paymentMode = "cash",
      recipientName,
      description,
      billUrl,
    } = data;

    if (!categoryId || !amount || !recipientName || !description) {
      return NextResponse.json({ error: "Category, Amount, Recipient, and Description are required" }, { status: 400 });
    }

    const year = new Date().getFullYear();
    const countRes = await client.execute("SELECT COUNT(*) as count FROM expenses");
    const nextSeq = Number(countRes.rows[0]?.count || 0) + 1;
    const voucherNumber = `EXP-${year}-${String(nextSeq).padStart(4, "0")}`;
    const expDate = expenseDate || new Date().toISOString().split("T")[0];

    const insertRes = await client.execute({
      sql: `INSERT INTO expenses 
            (voucher_number, category_id, amount, expense_date, payment_mode, recipient_name, description, bill_url, approved_by_user_id, branch_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      args: [
        voucherNumber,
        Number(categoryId),
        Number(amount),
        expDate,
        paymentMode,
        recipientName.trim(),
        description.trim(),
        billUrl || null,
        user?.id || 1,
      ],
    });

    const newExpId = Number(insertRes.lastInsertRowid);

    await logAudit({
      userId: user?.id,
      action: "ADD_EXPENSE",
      entityType: "expense",
      entityId: newExpId,
      details: { voucherNumber, amount, recipientName, description },
    });

    return NextResponse.json({
      success: true,
      voucherNumber,
      message: `Expense voucher ${voucherNumber} recorded successfully`,
    });
  } catch (error: any) {
    console.error("Expense creation error:", error);
    return NextResponse.json({ error: "Failed to record expense" }, { status: 500 });
  }
}
