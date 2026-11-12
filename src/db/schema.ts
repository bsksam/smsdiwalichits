import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// 1. Branches
export const branches = sqliteTable("branches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(), // e.g., BR-01
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  district: text("district").notNull(),
  pincode: text("pincode").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  isMainBranch: integer("is_main_branch", { mode: "boolean" }).default(false),
  status: text("status").default("active"), // active, inactive
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 2. Users (Staff / Admins)
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  mobile: text("mobile").notNull(),
  role: text("role").notNull().default("cashier"), // super_admin, admin, manager, cashier, collection_agent, viewer
  branchId: integer("branch_id").references(() => branches.id),
  status: text("status").default("active"), // active, inactive
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 3. Customers
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerCode: text("customer_code").notNull().unique(), // e.g. DC-2026-0001
  fullName: text("full_name").notNull(),
  fatherOrHusbandName: text("father_husband_name"),
  mobile: text("mobile").notNull(),
  altMobile: text("alt_mobile"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  district: text("district").notNull(),
  pincode: text("pincode").notNull(),
  aadhaarRef: text("aadhaar_ref"), // masked or last 4 digits for privacy
  photoUrl: text("photo_url"),
  idProofUrl: text("id_proof_url"),
  registrationDate: text("registration_date").notNull(),
  nomineeName: text("nominee_name"),
  nomineeRelation: text("nominee_relation"),
  nomineeMobile: text("nominee_mobile"),
  passwordHash: text("password_hash"),
  branchId: integer("branch_id").references(() => branches.id),
  status: text("status").default("active"), // active, inactive, blocked
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 4. Schemes
export const schemes = sqliteTable("schemes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  schemeCode: text("scheme_code").notNull().unique(), // e.g. SCH-001
  name: text("name").notNull(),
  tamilName: text("tamil_name").notNull(),
  schemeType: text("scheme_type").default("monthly_fixed"), // monthly_fixed, festival_special
  monthlyAmount: real("monthly_amount").notNull(), // e.g. 700, 1000, 1500, 2000
  totalMonths: integer("total_months").notNull().default(12),
  totalMembers: integer("total_members").default(100),
  joiningFee: real("joining_fee").default(0),
  dueDay: integer("due_day").default(10), // due by 10th of every month
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  groceryPackageValue: real("grocery_package_value").notNull(), // e.g. 10000 or 14000
  bonusPercentage: real("bonus_percentage").default(0),
  redemptionType: text("redemption_type").default("grocery_only"), // grocery_only, grocery_or_cash
  termsConditions: text("terms_conditions"),
  termsConditionsTamil: text("terms_conditions_tamil"),
  status: text("status").default("active"), // active, completed, inactive
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 5. Scheme Members (Enrollments)
export const schemeMembers = sqliteTable("scheme_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  schemeId: integer("scheme_id").notNull().references(() => schemes.id),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  passbookNumber: text("passbook_number").notNull().unique(),
  enrolledDate: text("enrolled_date").notNull(),
  status: text("status").default("active"), // active, completed, redeemed, cancelled
  completedInstallments: integer("completed_installments").default(0),
  totalPaidAmount: real("total_paid_amount").default(0),
  totalPendingAmount: real("total_pending_amount").default(0),
  maturityDate: text("maturity_date"),
  branchId: integer("branch_id").references(() => branches.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 6. Installments Schedule
export const installments = sqliteTable("installments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull().references(() => schemeMembers.id),
  schemeId: integer("scheme_id").notNull().references(() => schemes.id),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  installmentNumber: integer("installment_number").notNull(), // 1 to 12
  dueDate: text("due_date").notNull(),
  amount: real("amount").notNull(),
  paidAmount: real("paid_amount").default(0),
  status: text("status").default("pending"), // pending, paid, partial, overdue, advance
  paidDate: text("paid_date"),
  receiptId: integer("receipt_id"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 7. Payments
export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  receiptNumber: text("receipt_number").notNull().unique(), // RCP-2026-00001
  customerId: integer("customer_id").notNull().references(() => customers.id),
  schemeId: integer("scheme_id").notNull().references(() => schemes.id),
  memberId: integer("member_id").notNull().references(() => schemeMembers.id),
  installmentId: integer("installment_id").references(() => installments.id),
  installmentNumber: integer("installment_number").notNull(),
  amount: real("amount").notNull(),
  discount: real("discount").default(0),
  lateFee: real("late_fee").default(0),
  totalAmount: real("total_amount").notNull(),
  paymentDate: text("payment_date").notNull(),
  paymentMode: text("payment_mode").notNull(), // cash, upi, bank_transfer, card, cheque
  transactionRef: text("transaction_ref"),
  collectedByUserId: integer("collected_by_user_id").references(() => users.id),
  branchId: integer("branch_id").references(() => branches.id),
  remarks: text("remarks"),
  status: text("status").default("completed"), // completed, reversed
  reversalReason: text("reversal_reason"),
  reversedAt: text("reversed_at"),
  reversedByUserId: integer("reversed_by_user_id").references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 8. Grocery Categories
export const groceryCategories = sqliteTable("grocery_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  tamilName: text("tamil_name").notNull(),
  description: text("description"),
  icon: text("icon"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 9. Grocery Products
export const groceryProducts = sqliteTable("grocery_products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(), // e.g. GRC-001
  name: text("name").notNull(),
  tamilName: text("tamil_name").notNull(),
  categoryId: integer("category_id").references(() => groceryCategories.id),
  brand: text("brand"),
  unit: text("unit").notNull().default("kg"), // kg, gm, litre, packet, box, piece
  unitQuantity: text("unit_quantity").notNull(), // e.g. 1 kg, 500 gm, 1 litre, 50 gm
  purchasePrice: real("purchase_price").default(0),
  sellingPrice: real("selling_price").notNull(),
  imageUrl: text("image_url"),
  barcode: text("barcode"),
  stockQuantity: real("stock_quantity").notNull().default(0),
  minStockAlert: real("min_stock_alert").default(10),
  status: text("status").default("active"), // active, inactive
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 10. Package Templates (Diwali Packages)
export const packageTemplates = sqliteTable("package_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  tamilName: text("tamil_name").notNull(),
  description: text("description"),
  schemeId: integer("scheme_id").references(() => schemes.id),
  totalPackageValue: real("total_package_value").notNull().default(0),
  discountAmount: real("discount_amount").default(0),
  bonusAmount: real("bonus_amount").default(0),
  netPackageValue: real("net_package_value").notNull().default(0),
  status: text("status").default("active"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 11. Package Items
export const packageItems = sqliteTable("package_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  packageId: integer("package_id").notNull().references(() => packageTemplates.id),
  productId: integer("product_id").notNull().references(() => groceryProducts.id),
  quantity: real("quantity").notNull(), // quantity multiplier
  unitValue: real("unit_value").notNull(), // item price in package
  totalValue: real("total_value").notNull(),
});

// 12. Redemptions
export const redemptions = sqliteTable("redemptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  redemptionNumber: text("redemption_number").notNull().unique(), // RED-2026-0001
  memberId: integer("member_id").notNull().references(() => schemeMembers.id),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  schemeId: integer("scheme_id").notNull().references(() => schemes.id),
  packageId: integer("package_id").references(() => packageTemplates.id),
  redemptionType: text("redemption_type").default("grocery_package"), // grocery_package, cash
  redemptionDate: text("redemption_date").notNull(),
  totalPackageValue: real("total_package_value").notNull(),
  cashAmount: real("cash_amount").default(0),
  stockDeducted: integer("stock_deducted", { mode: "boolean" }).default(false),
  customerAcknowledged: integer("customer_acknowledged", { mode: "boolean" }).default(false),
  signatureUrl: text("signature_url"),
  remarks: text("remarks"),
  status: text("status").default("issued"), // issued, pending, cancelled
  issuedByUserId: integer("issued_by_user_id").references(() => users.id),
  branchId: integer("branch_id").references(() => branches.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 13. Redemption Items (Detailed snapshot of grocery items issued)
export const redemptionItems = sqliteTable("redemption_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  redemptionId: integer("redemption_id").notNull().references(() => redemptions.id),
  productId: integer("product_id").references(() => groceryProducts.id),
  productName: text("product_name").notNull(),
  tamilProductName: text("tamil_product_name").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
  unitPrice: real("unit_price").notNull(),
  totalPrice: real("total_price").notNull(),
});

// 14. Stock Transactions (Audit of stock additions and redemptions)
export const stockTransactions = sqliteTable("stock_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull().references(() => groceryProducts.id),
  transactionType: text("transaction_type").notNull(), // purchase, redemption_deduction, adjustment, return
  quantityChange: real("quantity_change").notNull(),
  previousStock: real("previous_stock").notNull(),
  newStock: real("new_stock").notNull(),
  referenceType: text("reference_type"), // redemption, purchase, manual
  referenceId: text("reference_id"),
  notes: text("notes"),
  createdByUserId: integer("created_by_user_id").references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 15. Expense Categories
export const expenseCategories = sqliteTable("expense_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 16. Expenses
export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  voucherNumber: text("voucher_number").notNull().unique(), // EXP-2026-0001
  categoryId: integer("category_id").notNull().references(() => expenseCategories.id),
  amount: real("amount").notNull(),
  expenseDate: text("expense_date").notNull(),
  paymentMode: text("payment_mode").notNull().default("cash"),
  recipientName: text("recipient_name").notNull(),
  description: text("description").notNull(),
  billUrl: text("bill_url"),
  approvedByUserId: integer("approved_by_user_id").references(() => users.id),
  branchId: integer("branch_id").references(() => branches.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 17. Notifications
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").references(() => customers.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  channel: text("channel").default("whatsapp"), // whatsapp, sms, in_app
  status: text("status").default("sent"), // pending, sent, failed
  scheduledAt: text("scheduled_at"),
  sentAt: text("sent_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 18. App Settings & Configurations
export const appSettings = sqliteTable("app_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: text("setting_value").notNull(),
  description: text("description"),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 19. Audit Logs
export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // CREATE, UPDATE, DELETE, PAYMENT_COLLECT, PAYMENT_REVERSE, REDEMPTION
  entityType: text("entity_type").notNull(), // customer, payment, redemption, scheme, user
  entityId: text("entity_id"),
  details: text("details"), // JSON string
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 20. Poster Configurations (Customizable Chit Posters)
export const posterConfigurations = sqliteTable("poster_configurations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  schemeId: integer("scheme_id").references(() => schemes.id),
  titleTamil: text("title_tamil").notNull(),
  titleEnglish: text("title_english").notNull(),
  shopNameTamil: text("shop_name_tamil").notNull(),
  shopNameEnglish: text("shop_name_english").notNull(),
  shopAddressTamil: text("shop_address_tamil").notNull(),
  shopAddressEnglish: text("shop_address_english").notNull(),
  phoneNumbers: text("phone_numbers").notNull(),
  logoUrl: text("logo_url"),
  leftConditionsTamil: text("left_conditions_tamil").notNull(), // JSON array of bullet points
  leftConditionsEnglish: text("left_conditions_english").notNull(),
  groceryListJson: text("grocery_list_json").notNull(), // JSON array of {nameEn, nameTa, qty, image}
  totalValueHighlight: text("total_value_highlight").notNull(),
  bonusHighlight: text("bonus_highlight").notNull(),
  footerNoticeTamil: text("footer_notice_tamil").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});
