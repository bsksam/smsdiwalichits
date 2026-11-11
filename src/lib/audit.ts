import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export async function logAudit(params: {
  userId?: number | null;
  action: string;
  entityType: string;
  entityId?: string | number | null;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await db.insert(auditLogs).values({
      userId: params.userId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ? String(params.entityId) : null,
      details: params.details ? JSON.stringify(params.details) : null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
