import { NextResponse } from "next/server";
import { client } from "@/db";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const result = await client.execute("SELECT * FROM app_settings ORDER BY id ASC");
    const settingsMap: Record<string, string> = {};
    for (const row of result.rows) {
      settingsMap[String(row.setting_key)] = String(row.setting_value);
    }
    return NextResponse.json({ settings: settingsMap, rows: result.rows });
  } catch (error: any) {
    console.error("Settings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const { settings } = await req.json();

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Invalid settings format" }, { status: 400 });
    }

    for (const [key, val] of Object.entries(settings)) {
      await client.execute({
        sql: `INSERT INTO app_settings (setting_key, setting_value, updated_at) 
              VALUES (?, ?, CURRENT_TIMESTAMP)
              ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP`,
        args: [key, String(val)],
      });
    }

    await logAudit({
      userId: user?.id,
      action: "UPDATE_SETTINGS",
      entityType: "settings",
      details: settings,
    });

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (error: any) {
    console.error("Settings save error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
