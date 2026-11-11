import bcrypt from "bcryptjs";
import { client } from "./index";
import { runMigrations } from "./migrate";

export async function seedDatabase() {
  await runMigrations();
  console.log("Seeding database with initial supermarket chit data...");

  const passwordHash = await bcrypt.hash("admin123", 10);
  const staffHash = await bcrypt.hash("staff123", 10);

  // 1. Insert Branches
  await client.execute({
    sql: `INSERT OR IGNORE INTO branches (id, code, name, address, city, district, pincode, phone, email, is_main_branch, status)
          VALUES 
          (1, 'BR-01', 'சேலம் தலைமை கிளை (Salem Main Branch)', '124, Bazaar Main Road, Near Clock Tower', 'Salem', 'Salem', '636001', '+91 98765 43210', 'salem@diwalichit.com', 1, 'active'),
          (2, 'BR-02', 'நாமக்கல் கிளை (Namakkal Branch)', '45, Trichy Main Road', 'Namakkal', 'Namakkal', '637001', '+91 94432 10987', 'namakkal@diwalichit.com', 0, 'active')`,
    args: [],
  });

  // 2. Insert Users
  await client.execute({
    sql: `INSERT OR IGNORE INTO users (id, username, password_hash, full_name, mobile, role, branch_id, status)
          VALUES 
          (1, 'admin', ?, 'Super Administrator', '+91 98765 43210', 'super_admin', 1, 'active'),
          (2, 'manager', ?, 'R. Sundaram (Manager)', '+91 98421 22334', 'manager', 1, 'active'),
          (3, 'cashier', ?, 'K. Priya (Cashier)', '+91 97890 33445', 'cashier', 1, 'active'),
          (4, 'agent1', ?, 'M. Saravanan (Collection Agent)', '+91 96554 44556', 'collection_agent', 1, 'active')`,
    args: [passwordHash, staffHash, staffHash, staffHash],
  });

  // 3. Grocery Categories
  await client.execute({
    sql: `INSERT OR IGNORE INTO grocery_categories (id, name, tamil_name, description, icon)
          VALUES 
          (1, 'Grains & Rice', 'தானியங்கள் & அரிசி', 'Essential staple grains and raw/boiled rice varieties', 'Wheat'),
          (2, 'Pulses & Dals', 'பருப்பு வகைகள்', 'High quality dals and pulses', 'ShoppingBag'),
          (3, 'Cooking Oils & Ghee', 'சமையல் எண்ணெய் & நெய்', 'Pure groundnut oil, sunflower oil, and cow ghee', 'Droplets'),
          (4, 'Flours & Rava', 'மாவு & ரவை வகைகள்', 'Freshly milled atta, maida, sooji, and flour mixes', 'Layers'),
          (5, 'Spices & Condiments', 'மசாலா & மளிகை பொருட்கள்', 'Turmeric, tamarind, salt, and aromatic spices', 'Sparkles'),
          (6, 'Festival Sweets & Mixes', 'இனிப்பு & பலகார மிக்ஸ்', 'Gulab Jamun, Bajji, and sweets instant mixes', 'Package')`,
    args: [],
  });

  // 4. Grocery Products (All 18+ from requirement)
  const products = [
    { id: 1, code: 'GRC-001', name: 'Turmeric Powder', tamil: 'மஞ்சள் தூள்', cat: 5, unit: 'gm', uqty: '50 grams', pprice: 15, sprice: 20, stock: 450, barcode: '890103001' },
    { id: 2, code: 'GRC-002', name: 'Deluxe Ponni Rice', tamil: 'டீலக்ஸ் பொன்னி அரிசி', cat: 1, unit: 'kg', uqty: '1 kg', pprice: 55, sprice: 68, stock: 1200, barcode: '890103002' },
    { id: 3, code: 'GRC-003', name: 'Urad Dal (White)', tamil: 'உளுத்தம் பருப்பு', cat: 2, unit: 'kg', uqty: '1 kg', pprice: 125, sprice: 148, stock: 350, barcode: '890103003' },
    { id: 4, code: 'GRC-004', name: 'Toor Dal (Premium)', tamil: 'துவரம் பருப்பு', cat: 2, unit: 'kg', uqty: '1 kg', pprice: 140, sprice: 165, stock: 400, barcode: '890103004' },
    { id: 5, code: 'GRC-005', name: 'Moong Dal', tamil: 'பாசிப் பருப்பு', cat: 2, unit: 'kg', uqty: '1 kg', pprice: 105, sprice: 125, stock: 300, barcode: '890103005' },
    { id: 6, code: 'GRC-006', name: 'Chana Dal', tamil: 'கடலைப் பருப்பு', cat: 2, unit: 'kg', uqty: '1 kg', pprice: 85, sprice: 98, stock: 320, barcode: '890103006' },
    { id: 7, code: 'GRC-007', name: 'Roasted Sooji / Rava', tamil: 'வறுத்த ரவை', cat: 4, unit: 'kg', uqty: '1 kg', pprice: 45, sprice: 56, stock: 280, barcode: '890103007' },
    { id: 8, code: 'GRC-008', name: 'Besan Flour (Gram Flour)', tamil: 'கடலை மாவு', cat: 4, unit: 'gm', uqty: '500 grams', pprice: 48, sprice: 60, stock: 260, barcode: '890103008' },
    { id: 9, code: 'GRC-009', name: 'Gulab Jamun Mix', tamil: 'குலாப் ஜாமூன் மிக்ஸ்', cat: 6, unit: 'packet', uqty: '1 packet (175g)', pprice: 65, sprice: 85, stock: 500, barcode: '890103009' },
    { id: 10, code: 'GRC-010', name: 'Bajji Bonda Mix', tamil: 'பஜ்ஜி போண்டா மிக்ஸ்', cat: 6, unit: 'gm', uqty: '200 grams', pprice: 28, sprice: 38, stock: 400, barcode: '890103010' },
    { id: 11, code: 'GRC-011', name: 'Refined Maida', tamil: 'மைதா மாவு', cat: 4, unit: 'gm', uqty: '500 grams', pprice: 24, sprice: 32, stock: 300, barcode: '890103011' },
    { id: 12, code: 'GRC-012', name: 'Idiyappam / Rice Flour', tamil: 'அரிசி மாவு', cat: 4, unit: 'gm', uqty: '500 grams', pprice: 26, sprice: 35, stock: 250, barcode: '890103012' },
    { id: 13, code: 'GRC-013', name: 'Pure Ragi Flour', tamil: 'ராகி மாவு', cat: 4, unit: 'gm', uqty: '500 grams', pprice: 28, sprice: 38, stock: 240, barcode: '890103013' },
    { id: 14, code: 'GRC-014', name: 'Seedless Tamarind', tamil: 'கொட்டை இல்லாத புளி', cat: 5, unit: 'gm', uqty: '500 grams', pprice: 85, sprice: 110, stock: 310, barcode: '890103014' },
    { id: 15, code: 'GRC-015', name: 'Refined Sunflower Oil', tamil: 'சூரியகாந்தி சமையல் எண்ணெய்', cat: 3, unit: 'litre', uqty: '1 litre', pprice: 115, sprice: 135, stock: 600, barcode: '890103015' },
    { id: 16, code: 'GRC-016', name: 'Cold Pressed Groundnut Oil', tamil: 'மரச்செக்கு கடலை எண்ணெய்', cat: 3, unit: 'litre', uqty: '1 litre', pprice: 175, sprice: 210, stock: 350, barcode: '890103016' },
    { id: 17, code: 'GRC-017', name: 'Crystal / Rock Salt', tamil: 'தூய கல் உப்பு', cat: 5, unit: 'kg', uqty: '1 kg', pprice: 12, sprice: 18, stock: 500, barcode: '890103017' },
    { id: 18, code: 'GRC-018', name: 'Chakki Fresh Wheat Flour', tamil: 'சக்கி பிரெஷ் கோதுமை மாவு', cat: 4, unit: 'kg', uqty: '1 kg', pprice: 44, sprice: 55, stock: 450, barcode: '890103018' },
    { id: 19, code: 'GRC-019', name: 'Pure White Sugar', tamil: 'தூய சர்க்கரை', cat: 1, unit: 'kg', uqty: '1 kg', pprice: 38, sprice: 45, stock: 700, barcode: '890103019' },
    { id: 20, code: 'GRC-020', name: 'Diwali Sweet Combo Pack', tamil: 'தீபாவளி சிறப்பு ஸ்வீட் பாக்ஸ்', cat: 6, unit: 'box', uqty: '1 box (500g)', pprice: 180, sprice: 250, stock: 200, barcode: '890103020' },
  ];

  for (const p of products) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO grocery_products 
            (id, code, name, tamil_name, category_id, brand, unit, unit_quantity, purchase_price, selling_price, stock_quantity, min_stock_alert, barcode, status)
            VALUES (?, ?, ?, ?, ?, 'Lakshmi Supermarket', ?, ?, ?, ?, ?, 15, ?, 'active')`,
      args: [p.id, p.code, p.name, p.tamil, p.cat, p.unit, p.uqty, p.pprice, p.sprice, p.stock, p.barcode],
    });
  }

  // 5. Chit Schemes
  await client.execute({
    sql: `INSERT OR IGNORE INTO schemes 
          (id, scheme_code, name, tamil_name, scheme_type, monthly_amount, total_months, total_members, joining_fee, due_day, start_date, end_date, grocery_package_value, bonus_percentage, redemption_type, terms_conditions, terms_conditions_tamil, status)
          VALUES 
          (1, 'SCH-700', 'Diwali Mangala Chit (₹700)', 'தீபாவளி மங்கள சேமிப்புத் திட்டம் (₹700)', 'monthly_fixed', 700, 12, 100, 0, 10, '2026-01-01', '2026-12-31', 10000, 19.04, 'grocery_only', 
           '1. Monthly payment ₹700 for 12 months (Total ₹8,400).\\n2. Payment must be paid before 10th of every month.\\n3. Full Diwali grocery mega package worth ₹10,000 delivered before Diwali.\\n4. Passbook must be presented at redemption.', 
           '1. மாதம் தோறும் ₹700 வீதம் 12 மாதங்கள் செலுத்த வேண்டும் (மொத்தம் ₹8,400).\\n2. ஒவ்வொரு மாதமும் 10-ஆம் தேதிக்குள் தவணை செலுத்தப்பட வேண்டும்.\\n3. தீபாவளி பண்டிகைக்கு முன்பாக ₹10,000 மதிப்புள்ள மளிகைப் பொருட்கள் வழங்கப்படும்.\\n4. பொருள் பெறும்போது சந்தாதாரர் பாஸ்புக் சமர்ப்பிக்க வேண்டும்.', 'active'),

          (2, 'SCH-1000', 'Diwali Bumper Scheme (₹1,000)', 'தீபாவளி பம்பர் மளிகை திட்டம் (₹1,000)', 'monthly_fixed', 1000, 12, 150, 0, 10, '2026-01-01', '2026-12-31', 14500, 20.83, 'grocery_only', 
           '1. Monthly payment ₹1,000 for 12 months (Total ₹12,000).\\n2. Attractive Diwali Grocery Gift Box + Rice Bag worth ₹14,500.\\n3. No hidden charges or deductions.', 
           '1. மாதம் தோறும் ₹1,000 வீதம் 12 மாதங்கள் (மொத்தம் ₹12,000).\\n2. தீபாவளிக்கு ₹14,500 மதிப்புள்ள பிரீமியம் மளிகை தொகுப்பு மற்றும் அரிசி பை வழங்கப்படும்.\\n3. எவ்வித கூடுதல் பிடித்தமும் கிடையாது.', 'active'),

          (3, 'SCH-1500', 'Diwali Royal Scheme (₹1,500)', 'தீபாவளி ராயல் குடும்ப திட்டம் (₹1,500)', 'monthly_fixed', 1500, 12, 75, 0, 10, '2026-01-01', '2026-12-31', 22000, 22.22, 'grocery_only', 
           '1. Monthly payment ₹1,500 for 12 months (Total ₹18,000).\\n2. Complete grocery basket for entire festival season worth ₹22,000.', 
           '1. மாதம் தோறும் ₹1,500 வீதம் 12 மாதங்கள் (மொத்தம் ₹18,000).\\n2. ₹22,000 மதிப்புள்ள முழுமையான தீபாவளி மளிகை & இனிப்புத் தொகுப்பு வழங்கப்படும்.', 'active')`,
    args: [],
  });

  // 6. Package Templates
  await client.execute({
    sql: `INSERT OR IGNORE INTO package_templates 
          (id, name, tamil_name, description, scheme_id, total_package_value, discount_amount, bonus_amount, net_package_value, status)
          VALUES 
          (1, 'DIWALI SPECIAL MINI PACKAGE', 'தீபாவளி ஸ்பெஷல் மினி மளிகை பேக்கேஜ்', 'Standard 18-item grocery package for ₹700 scheme', 1, 10000, 0, 1600, 10000, 'active'),
          (2, 'DIWALI MEGA BUMPER PACKAGE', 'தீபாவளி மெகா பம்பர் மளிகை பேக்கேஜ்', 'Premium grocery package for ₹1,000 scheme', 2, 14500, 0, 2500, 14500, 'active')`,
    args: [],
  });

  // Package items for Package 1 (Diwali Special Package)
  const pkg1Items = [
    { pkg: 1, prod: 2, qty: 10, val: 68 },  // 10 kg Rice
    { pkg: 1, prod: 4, qty: 2, val: 165 },  // 2 kg Toor Dal
    { pkg: 1, prod: 3, qty: 2, val: 148 },  // 2 kg Urad Dal
    { pkg: 1, prod: 5, qty: 1, val: 125 },  // 1 kg Moong Dal
    { pkg: 1, prod: 6, qty: 1, val: 98 },   // 1 kg Chana Dal
    { pkg: 1, prod: 15, qty: 2, val: 135 }, // 2 Ltr Sunflower Oil
    { pkg: 1, prod: 16, qty: 1, val: 210 }, // 1 Ltr Groundnut Oil
    { pkg: 1, prod: 18, qty: 5, val: 55 },  // 5 kg Wheat Flour
    { pkg: 1, prod: 19, qty: 3, val: 45 },  // 3 kg Sugar
    { pkg: 1, prod: 7, qty: 1, val: 56 },   // 1 kg Rava
    { pkg: 1, prod: 8, qty: 2, val: 60 },   // 1 kg Besan
    { pkg: 1, prod: 9, qty: 2, val: 85 },   // 2 Gulab Jamun
    { pkg: 1, prod: 10, qty: 2, val: 38 },  // 2 Bajji Mix
    { pkg: 1, prod: 11, qty: 1, val: 32 },  // 500g Maida
    { pkg: 1, prod: 14, qty: 1, val: 110 }, // 500g Tamarind
    { pkg: 1, prod: 1, qty: 2, val: 20 },   // 100g Turmeric
    { pkg: 1, prod: 17, qty: 2, val: 18 },  // 2 kg Salt
    { pkg: 1, prod: 20, qty: 1, val: 250 }, // Sweet box
  ];

  for (const it of pkg1Items) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO package_items (package_id, product_id, quantity, unit_value, total_value)
            VALUES (?, ?, ?, ?, ?)`,
      args: [it.pkg, it.prod, it.qty, it.val, it.qty * it.val],
    });
  }

  // 7. Customers
  const customerList = [
    { id: 1, code: 'DC-2026-0001', name: 'S. Murugesan', fName: 'Subramanian', mobile: '9842101122', alt: '9443011223', addr: '15/2, Gandhi Road, Suramangalam', city: 'Salem', dist: 'Salem', pin: '636005', reg: '2026-01-02', nom: 'M. Valli', rel: 'Wife', nomMob: '9842101123' },
    { id: 2, code: 'DC-2026-0002', name: 'K. Revathi', fName: 'Kannan', mobile: '9789122334', alt: '9842522334', addr: '44, Pillayar Kovil Street, Ammapet', city: 'Salem', dist: 'Salem', pin: '636003', reg: '2026-01-03', nom: 'K. Vignesh', rel: 'Son', nomMob: '9789122335' },
    { id: 3, code: 'DC-2026-0003', name: 'M. Senthil Kumar', fName: 'Mani', mobile: '9443344556', alt: '9894044556', addr: '82, Anna Salai, Hasthampatti', city: 'Salem', dist: 'Salem', pin: '636007', reg: '2026-01-05', nom: 'S. Divya', rel: 'Wife', nomMob: '9443344557' },
    { id: 4, code: 'DC-2026-0004', name: 'P. Lakshmi', fName: 'Palanisamy', mobile: '9655155667', alt: '9789255667', addr: '109, Cherry Road, Maravaneri', city: 'Salem', dist: 'Salem', pin: '636007', reg: '2026-01-06', nom: 'P. Karthik', rel: 'Son', nomMob: '9655155668' },
    { id: 5, code: 'DC-2026-0005', name: 'R. Anbarasan', fName: 'Ramasamy', mobile: '9894266778', alt: '9443566778', addr: '23, Trichy Main Road, Dadagapatty', city: 'Salem', dist: 'Salem', pin: '636006', reg: '2026-01-08', nom: 'A. Selvi', rel: 'Wife', nomMob: '9894266779' },
    { id: 6, code: 'DC-2026-0006', name: 'V. Kavitha', fName: 'Venkatachalam', mobile: '9751077889', alt: '9842877889', addr: '76, Fort Main Road', city: 'Salem', dist: 'Salem', pin: '636001', reg: '2026-01-10', nom: 'V. Praveen', rel: 'Brother', nomMob: '9751077890' },
  ];

  for (const c of customerList) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO customers 
            (id, customer_code, full_name, father_husband_name, mobile, alt_mobile, address, city, district, pincode, registration_date, nominee_name, nominee_relation, nominee_mobile, branch_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'active')`,
      args: [c.id, c.code, c.name, c.fName, c.mobile, c.alt, c.addr, c.city, c.dist, c.pin, c.reg, c.nom, c.rel, c.nomMob],
    });
  }

  // 8. Enroll Scheme Members & Create Installment Schedules
  // Member 1: S. Murugesan in SCH-700
  await client.execute({
    sql: `INSERT OR IGNORE INTO scheme_members 
          (id, scheme_id, customer_id, passbook_number, enrolled_date, status, completed_installments, total_paid_amount, total_pending_amount, maturity_date, branch_id)
          VALUES 
          (1, 1, 1, 'PB-700-001', '2026-01-02', 'active', 10, 7000, 1400, '2026-12-31', 1),
          (2, 2, 2, 'PB-1000-001', '2026-01-03', 'active', 10, 10000, 2000, '2026-12-31', 1),
          (3, 1, 3, 'PB-700-002', '2026-01-05', 'active', 9, 6300, 2100, '2026-12-31', 1),
          (4, 2, 4, 'PB-1000-002', '2026-01-06', 'active', 10, 10000, 2000, '2026-12-31', 1),
          (5, 3, 5, 'PB-1500-001', '2026-01-08', 'active', 10, 15000, 3000, '2026-12-31', 1),
          (6, 1, 6, 'PB-700-003', '2026-01-10', 'active', 12, 8400, 0, '2026-12-31', 1)`,
    args: [],
  });

  // Generate 12 installments for Member 1 (₹700)
  for (let i = 1; i <= 12; i++) {
    const month = i < 10 ? `0${i}` : `${i}`;
    const dueDate = `2026-${month}-10`;
    const isPaid = i <= 10;
    const status = isPaid ? 'paid' : (i === 11 ? 'overdue' : 'pending');
    const paidDate = isPaid ? `2026-${month}-05` : null;

    await client.execute({
      sql: `INSERT OR IGNORE INTO installments 
            (id, member_id, scheme_id, customer_id, installment_number, due_date, amount, paid_amount, status, paid_date)
            VALUES (?, 1, 1, 1, ?, ?, 700, ?, ?, ?)`,
      args: [i, i, dueDate, isPaid ? 700 : 0, status, paidDate],
    });

    if (isPaid) {
      const receiptNum = `RCP-2026-${String(i).padStart(5, '0')}`;
      await client.execute({
        sql: `INSERT OR IGNORE INTO payments 
              (id, receipt_number, customer_id, scheme_id, member_id, installment_id, installment_number, amount, discount, late_fee, total_amount, payment_date, payment_mode, transaction_ref, collected_by_user_id, branch_id, remarks, status)
              VALUES (?, ?, 1, 1, 1, ?, ?, 700, 0, 0, 700, ?, 'cash', 'CASH-REC', 3, 1, 'Monthly chit installment', 'completed')`,
        args: [i, receiptNum, i, i, paidDate],
      });
    }
  }

  // Generate 12 installments for Member 6 (Fully Paid - Eligible for Redemption!)
  for (let i = 1; i <= 12; i++) {
    const instId = 100 + i;
    const month = i < 10 ? `0${i}` : `${i}`;
    const dueDate = `2026-${month}-10`;
    const paidDate = `2026-${month}-04`;

    await client.execute({
      sql: `INSERT OR IGNORE INTO installments 
            (id, member_id, scheme_id, customer_id, installment_number, due_date, amount, paid_amount, status, paid_date)
            VALUES (?, 6, 1, 6, ?, ?, 700, 700, 'paid', ?)`,
      args: [instId, i, dueDate, paidDate],
    });

    const receiptNum = `RCP-2026-${String(instId).padStart(5, '0')}`;
    await client.execute({
      sql: `INSERT OR IGNORE INTO payments 
            (id, receipt_number, customer_id, scheme_id, member_id, installment_id, installment_number, amount, discount, late_fee, total_amount, payment_date, payment_mode, transaction_ref, collected_by_user_id, branch_id, remarks, status)
            VALUES (?, ?, 6, 1, 6, ?, ?, 700, 0, 0, 700, ?, 'upi', 'UPI/2026/TXN889', 3, 1, 'Monthly chit installment', 'completed')`,
      args: [instId, receiptNum, instId, i, paidDate],
    });
  }

  // 9. Expense Categories & Initial Expenses
  await client.execute({
    sql: `INSERT OR IGNORE INTO expense_categories (id, name, description)
          VALUES 
          (1, 'Shop Rent & Utilities', 'Electricity, shop rental, water charges'),
          (2, 'Staff Salary & Incentives', 'Monthly staff salaries and collection incentives'),
          (3, 'Printing & Stationery', 'Passbooks, receipts, promotional leaflets and poster prints'),
          (4, 'Packaging & Bags', 'Grocery non-woven bags, cardboard boxes, tape'),
          (5, 'Tea & Refreshments', 'Daily office and customer tea expenses')`,
    args: [],
  });

  await client.execute({
    sql: `INSERT OR IGNORE INTO expenses 
          (id, voucher_number, category_id, amount, expense_date, payment_mode, recipient_name, description, approved_by_user_id, branch_id)
          VALUES 
          (1, 'EXP-2026-0001', 3, 4500, '2026-01-15', 'cash', 'Sri Murugan Printers', 'Printing 1,000 Diwali Chit Passbooks & Receipts', 1, 1),
          (2, 'EXP-2026-0002', 4, 6800, '2026-01-20', 'upi', 'Sakthi Packaging Mills', 'Custom branded cloth grocery bags 500 pcs', 1, 1),
          (3, 'EXP-2026-0003', 1, 15000, '2026-02-01', 'bank_transfer', 'K. Venugopal (Building Owner)', 'Monthly shop rent for February 2026', 1, 1)`,
    args: [],
  });

  // 10. Poster Configuration (Tamil Supermarket Chit Layout reference)
  const defaultPosterConditionsTa = JSON.stringify([
    "மாதம் தோறும் ₹700 வீதம் 12 மாதங்கள் செலுத்த வேண்டும்.",
    "ஒவ்வொரு மாதமும் 10-ஆம் தேதிக்குள் தவணைத் தொகை செலுத்தப்பட வேண்டும்.",
    "முன்கூட்டியே செலுத்தும் சந்தாதாரர்களுக்கு சிறப்பு குலுக்கல் பரிசு உண்டு.",
    "தவணை தவறியவர்களுக்கு பண்டிகையின் போது பொருட்கள் மட்டுமே வழங்கப்படும்; எந்தவித அபராதமும் வசூலிக்கப்பட மாட்டாது.",
    "அனைத்து மளிகைப் பொருட்களும் A1 முதல் தரமான பிராண்டட் பொருட்கள் மட்டுமே.",
    "பொருட்கள் தீபாவளி பண்டிகைக்கு 10 நாட்களுக்கு முன்பாக நேரில் வழங்கப்படும்.",
    "பொருட்கள் பெறும்போது அசல் பாஸ்புக் மற்றும் ரசீதுகள் கட்டாயம் சமர்ப்பிக்கப்பட வேண்டும்."
  ]);

  const defaultPosterConditionsEn = JSON.stringify([
    "Pay ₹700 per month for 12 months consecutively.",
    "Monthly installment must be paid on or before 10th of every month.",
    "Special lucky draw gifts for early bird installment payers.",
    "All grocery items supplied are 100% genuine, fresh, top-tier branded goods.",
    "Package distribution commences 10 days prior to the Diwali festival.",
    "Original member passbook must be produced at the time of delivery."
  ]);

  const defaultPosterGroceries = JSON.stringify([
    { sNo: 1, nameTa: "பொன்னி புழுங்கல் அரிசி", nameEn: "Ponni Boiled Rice", qty: "10 KG" },
    { sNo: 2, nameTa: "துவரம் பருப்பு (A1 தரம்)", nameEn: "Toor Dal (Premium)", qty: "2 KG" },
    { sNo: 3, nameTa: "உளுத்தம் பருப்பு (வெள்ளை)", nameEn: "Urad Dal (White)", qty: "2 KG" },
    { sNo: 4, nameTa: "பாசிப் பருப்பு", nameEn: "Moong Dal", qty: "1 KG" },
    { sNo: 5, nameTa: "கடலைப் பருப்பு", nameEn: "Chana Dal", qty: "1 KG" },
    { sNo: 6, nameTa: "சமையல் எண்ணெய் (சன்ஃபிளவர்)", nameEn: "Refined Sunflower Oil", qty: "2 Ltr" },
    { sNo: 7, nameTa: "மரச்செக்கு கடலை எண்ணெய்", nameEn: "Cold Pressed Groundnut Oil", qty: "1 Ltr" },
    { sNo: 8, nameTa: "சக்கி பிரெஷ் கோதுமை மாவு", nameEn: "Chakki Fresh Wheat Flour", qty: "5 KG" },
    { sNo: 9, nameTa: "தூய வெள்ளை சர்க்கரை", nameEn: "Pure White Sugar", qty: "3 KG" },
    { sNo: 10, nameTa: "வறுத்த ரவை (சூஜி)", nameEn: "Roasted Sooji / Rava", qty: "1 KG" },
    { sNo: 11, nameTa: "கடலை மாவு (Besan)", nameEn: "Besan / Gram Flour", qty: "1 KG" },
    { sNo: 12, nameTa: "குலாப் ஜாமூன் மிக்ஸ்", nameEn: "Gulab Jamun Mix", qty: "2 Packets" },
    { sNo: 13, nameTa: "பஜ்ஜி போண்டா மிக்ஸ்", nameEn: "Bajji Bonda Mix", qty: "2 Packets" },
    { sNo: 14, nameTa: "மைதா மாவு", nameEn: "Refined Maida", qty: "500 GM" },
    { sNo: 15, nameTa: "அரிசி மாவு (இடியாப்ப மாவு)", nameEn: "Rice / Idiyappam Flour", qty: "500 GM" },
    { sNo: 16, nameTa: "ராகி மாவு", nameEn: "Pure Ragi Flour", qty: "500 GM" },
    { sNo: 17, nameTa: "கொட்டை இல்லாத புளி", nameEn: "Seedless Tamarind", qty: "500 GM" },
    { sNo: 18, nameTa: "மஞ்சள் தூள்", nameEn: "Turmeric Powder", qty: "100 GM" },
    { sNo: 19, nameTa: "தூய கல் உப்பு", nameEn: "Crystal Salt", qty: "2 KG" },
    { sNo: 20, nameTa: "தீபாவளி சிறப்பு ஸ்வீட் பாக்ஸ்", nameEn: "Diwali Special Sweet Box", qty: "500 GM" }
  ]);

  await client.execute({
    sql: `INSERT OR REPLACE INTO poster_configurations 
          (id, scheme_id, title_tamil, title_english, shop_name_tamil, shop_name_english, shop_address_tamil, shop_address_english, phone_numbers, left_conditions_tamil, left_conditions_english, grocery_list_json, total_value_highlight, bonus_highlight, footer_notice_tamil)
          VALUES 
          (1, 1, 
           'தீபாவளி மங்கள மளிகை சேமிப்புத் திட்டம் - 2026', 
           'DIWALI MANGALA GROCERY SAVINGS SCHEME - 2026',
           'ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட்',
           'SRI LAKSHMI SUPERMARKET',
           'எண். 124, பஜார் மெயின் ரோடு, மணிக்கூண்டு அருகில், சேலம் - 636 001',
           'No. 124, Bazaar Main Road, Near Clock Tower, Salem - 636 001',
           '98765 43210 / 94432 10987',
           ?, ?, ?, 
           'மொத்த சந்தா: ₹8,400 (மாதம் ₹700 x 12) | பொருட்கள் மதிப்பு: ₹10,000/-', 
           'உங்களுக்கு ₹1,600 மதிப்புள்ள போனஸ் இலவச மளிகைப் பொருட்கள்!', 
           'முன்பதிவு செய்ய உடனே தொடர்பு கொள்ளவும். குறைவான சந்தாதாரர்களுக்கு மட்டுமே அனுமதி!')`,
    args: [defaultPosterConditionsTa, defaultPosterConditionsEn, defaultPosterGroceries],
  });

  // 11. App Settings
  const settings = [
    { key: 'shop_name', val: 'ஸ்ரீ லட்சுமி சூப்பர் மார்க்கெட் (SRI LAKSHMI SUPERMARKET)', desc: 'Full business name' },
    { key: 'shop_address', val: '124, Bazaar Main Road, Near Clock Tower, Salem - 636001, Tamil Nadu', desc: 'Shop Address' },
    { key: 'shop_phone', val: '+91 98765 43210 / +91 94432 10987', desc: 'Contact numbers' },
    { key: 'shop_gst', val: '33AABCS1429B1Z8', desc: 'GSTIN / Registration Number' },
    { key: 'default_language', val: 'ta', desc: 'Default ERP language (ta / en)' },
    { key: 'receipt_printer_type', val: 'thermal_80mm', desc: 'Receipt print format' },
    { key: 'whatsapp_payment_template', val: 'வணக்கம் {CUSTOMER_NAME}, உங்கள் தீபாவளி சீட்டு {SCHEME_NAME} தவணை எண் {INST_NUM} தொகை ₹{AMOUNT} வெற்றிகரமாக பெறப்பட்டது. ரசீது எண்: {RECEIPT_NO}. நன்றி! - {SHOP_NAME}', desc: 'WhatsApp payment receipt message' },
    { key: 'whatsapp_reminder_template', val: 'அன்புடையீர் {CUSTOMER_NAME}, உங்களின் தீபாவளி சீட்டு {SCHEME_NAME} மாதத் தவணை தொகை ₹{AMOUNT} செலுத்த கடைசி நாள்: {DUE_DATE}. உடனடியாக செலுத்தி பரிசுகளை வெல்லுங்கள். நன்றி! - {SHOP_NAME}', desc: 'WhatsApp installment reminder message' },
  ];

  for (const s of settings) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO app_settings (setting_key, setting_value, description) VALUES (?, ?, ?)`,
      args: [s.key, s.val, s.desc],
    });
  }

  console.log("Database seeded successfully with authentic Supermarket Chit data!");
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seeding error:", err);
      process.exit(1);
    });
}
