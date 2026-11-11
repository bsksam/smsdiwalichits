import { client } from "./index";

export async function runMigrations() {
  console.log("Running SQLite / Turso migrations...");

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      district TEXT NOT NULL,
      pincode TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      is_main_branch INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cashier',
      branch_id INTEGER REFERENCES branches(id),
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_code TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      father_husband_name TEXT,
      mobile TEXT NOT NULL,
      alt_mobile TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      district TEXT NOT NULL,
      pincode TEXT NOT NULL,
      aadhaar_ref TEXT,
      photo_url TEXT,
      id_proof_url TEXT,
      registration_date TEXT NOT NULL,
      nominee_name TEXT,
      nominee_relation TEXT,
      nominee_mobile TEXT,
      branch_id INTEGER REFERENCES branches(id),
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schemes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scheme_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      tamil_name TEXT NOT NULL,
      scheme_type TEXT DEFAULT 'monthly_fixed',
      monthly_amount REAL NOT NULL,
      total_months INTEGER NOT NULL DEFAULT 12,
      total_members INTEGER DEFAULT 100,
      joining_fee REAL DEFAULT 0,
      due_day INTEGER DEFAULT 10,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      grocery_package_value REAL NOT NULL,
      bonus_percentage REAL DEFAULT 0,
      redemption_type TEXT DEFAULT 'grocery_only',
      terms_conditions TEXT,
      terms_conditions_tamil TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scheme_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scheme_id INTEGER NOT NULL REFERENCES schemes(id),
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      passbook_number TEXT NOT NULL UNIQUE,
      enrolled_date TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      completed_installments INTEGER DEFAULT 0,
      total_paid_amount REAL DEFAULT 0,
      total_pending_amount REAL DEFAULT 0,
      maturity_date TEXT,
      branch_id INTEGER REFERENCES branches(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS installments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL REFERENCES scheme_members(id),
      scheme_id INTEGER NOT NULL REFERENCES schemes(id),
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      installment_number INTEGER NOT NULL,
      due_date TEXT NOT NULL,
      amount REAL NOT NULL,
      paid_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      paid_date TEXT,
      receipt_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_number TEXT NOT NULL UNIQUE,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      scheme_id INTEGER NOT NULL REFERENCES schemes(id),
      member_id INTEGER NOT NULL REFERENCES scheme_members(id),
      installment_id INTEGER REFERENCES installments(id),
      installment_number INTEGER NOT NULL,
      amount REAL NOT NULL,
      discount REAL DEFAULT 0,
      late_fee REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      payment_mode TEXT NOT NULL,
      transaction_ref TEXT,
      collected_by_user_id INTEGER REFERENCES users(id),
      branch_id INTEGER REFERENCES branches(id),
      remarks TEXT,
      status TEXT DEFAULT 'completed',
      reversal_reason TEXT,
      reversed_at TEXT,
      reversed_by_user_id INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_number TEXT NOT NULL UNIQUE,
      payment_id INTEGER,
      customer_id INTEGER,
      total_amount REAL,
      payment_mode TEXT,
      payment_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS grocery_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      tamil_name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS grocery_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      tamil_name TEXT NOT NULL,
      category_id INTEGER REFERENCES grocery_categories(id),
      brand TEXT,
      unit TEXT NOT NULL DEFAULT 'kg',
      unit_quantity TEXT NOT NULL,
      purchase_price REAL DEFAULT 0,
      selling_price REAL NOT NULL,
      image_url TEXT,
      barcode TEXT,
      stock_quantity REAL NOT NULL DEFAULT 0,
      min_stock_alert REAL DEFAULT 10,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS package_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      tamil_name TEXT NOT NULL,
      description TEXT,
      scheme_id INTEGER REFERENCES schemes(id),
      total_package_value REAL NOT NULL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      bonus_amount REAL DEFAULT 0,
      net_package_value REAL NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS package_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_id INTEGER NOT NULL REFERENCES package_templates(id),
      product_id INTEGER NOT NULL REFERENCES grocery_products(id),
      quantity REAL NOT NULL,
      unit_value REAL NOT NULL,
      total_value REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS redemptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      redemption_number TEXT NOT NULL UNIQUE,
      member_id INTEGER NOT NULL REFERENCES scheme_members(id),
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      scheme_id INTEGER NOT NULL REFERENCES schemes(id),
      package_id INTEGER REFERENCES package_templates(id),
      redemption_type TEXT DEFAULT 'grocery_package',
      redemption_date TEXT NOT NULL,
      total_package_value REAL NOT NULL,
      cash_amount REAL DEFAULT 0,
      stock_deducted INTEGER DEFAULT 0,
      customer_acknowledged INTEGER DEFAULT 0,
      signature_url TEXT,
      remarks TEXT,
      status TEXT DEFAULT 'issued',
      issued_by_user_id INTEGER REFERENCES users(id),
      branch_id INTEGER REFERENCES branches(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS redemption_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      redemption_id INTEGER NOT NULL REFERENCES redemptions(id),
      product_id INTEGER REFERENCES grocery_products(id),
      product_name TEXT NOT NULL,
      tamil_product_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stock_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES grocery_products(id),
      transaction_type TEXT NOT NULL,
      quantity_change REAL NOT NULL,
      previous_stock REAL NOT NULL,
      new_stock REAL NOT NULL,
      reference_type TEXT,
      reference_id TEXT,
      notes TEXT,
      created_by_user_id INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expense_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      voucher_number TEXT NOT NULL UNIQUE,
      category_id INTEGER NOT NULL REFERENCES expense_categories(id),
      amount REAL NOT NULL,
      expense_date TEXT NOT NULL,
      payment_mode TEXT NOT NULL DEFAULT 'cash',
      recipient_name TEXT NOT NULL,
      description TEXT NOT NULL,
      bill_url TEXT,
      approved_by_user_id INTEGER REFERENCES users(id),
      branch_id INTEGER REFERENCES branches(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER REFERENCES customers(id),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      channel TEXT DEFAULT 'whatsapp',
      status TEXT DEFAULT 'sent',
      scheduled_at TEXT,
      sent_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT NOT NULL UNIQUE,
      setting_value TEXT NOT NULL,
      description TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS poster_configurations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scheme_id INTEGER REFERENCES schemes(id),
      title_tamil TEXT NOT NULL,
      title_english TEXT NOT NULL,
      shop_name_tamil TEXT NOT NULL,
      shop_name_english TEXT NOT NULL,
      shop_address_tamil TEXT NOT NULL,
      shop_address_english TEXT NOT NULL,
      phone_numbers TEXT NOT NULL,
      logo_url TEXT,
      left_conditions_tamil TEXT NOT NULL,
      left_conditions_english TEXT NOT NULL,
      grocery_list_json TEXT NOT NULL,
      total_value_highlight TEXT NOT NULL,
      bonus_highlight TEXT NOT NULL,
      footer_notice_tamil TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Database migrations completed successfully.");
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration error:", err);
      process.exit(1);
    });
}
