import { NextResponse } from "next/server";
import { client } from "@/db";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schemeId = searchParams.get("schemeId") || "1";

    let configRes = await client.execute({
      sql: "SELECT * FROM poster_configurations WHERE scheme_id = ? ORDER BY id DESC LIMIT 1",
      args: [schemeId],
    });

    if (configRes.rows.length === 0) {
      configRes = await client.execute("SELECT * FROM poster_configurations ORDER BY id ASC LIMIT 1");
    }

    if (configRes.rows.length === 0) {
      return NextResponse.json({ error: "Poster configuration not found" }, { status: 404 });
    }

    const config = configRes.rows[0];

    return NextResponse.json({
      config: {
        ...config,
        leftConditionsTamil: JSON.parse(String(config.left_conditions_tamil || "[]")),
        leftConditionsEnglish: JSON.parse(String(config.left_conditions_english || "[]")),
        groceryList: JSON.parse(String(config.grocery_list_json || "[]")),
      },
    });
  } catch (error: any) {
    console.error("Poster config fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch poster config" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const data = await req.json();

    const {
      schemeId = 1,
      titleTamil,
      titleEnglish,
      shopNameTamil,
      shopNameEnglish,
      shopAddressTamil,
      shopAddressEnglish,
      phoneNumbers,
      logoUrl,
      leftConditionsTamil,
      leftConditionsEnglish,
      groceryList,
      totalValueHighlight,
      bonusHighlight,
      footerNoticeTamil,
    } = data;

    const leftTaJson = JSON.stringify(leftConditionsTamil || []);
    const leftEnJson = JSON.stringify(leftConditionsEnglish || []);
    const groceryJson = JSON.stringify(groceryList || []);

    const existingRes = await client.execute({
      sql: "SELECT id FROM poster_configurations WHERE scheme_id = ?",
      args: [schemeId],
    });

    if (existingRes.rows.length > 0) {
      await client.execute({
        sql: `UPDATE poster_configurations 
              SET title_tamil = ?, title_english = ?, shop_name_tamil = ?, shop_name_english = ?,
                  shop_address_tamil = ?, shop_address_english = ?, phone_numbers = ?, logo_url = ?,
                  left_conditions_tamil = ?, left_conditions_english = ?, grocery_list_json = ?,
                  total_value_highlight = ?, bonus_highlight = ?, footer_notice_tamil = ?,
                  updated_at = CURRENT_TIMESTAMP
              WHERE scheme_id = ?`,
        args: [
          titleTamil,
          titleEnglish,
          shopNameTamil,
          shopNameEnglish,
          shopAddressTamil,
          shopAddressEnglish,
          phoneNumbers,
          logoUrl || null,
          leftTaJson,
          leftEnJson,
          groceryJson,
          totalValueHighlight,
          bonusHighlight,
          footerNoticeTamil,
          schemeId,
        ],
      });
    } else {
      await client.execute({
        sql: `INSERT INTO poster_configurations 
              (scheme_id, title_tamil, title_english, shop_name_tamil, shop_name_english, shop_address_tamil, shop_address_english, phone_numbers, logo_url, left_conditions_tamil, left_conditions_english, grocery_list_json, total_value_highlight, bonus_highlight, footer_notice_tamil)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          schemeId,
          titleTamil,
          titleEnglish,
          shopNameTamil,
          shopNameEnglish,
          shopAddressTamil,
          shopAddressEnglish,
          phoneNumbers,
          logoUrl || null,
          leftTaJson,
          leftEnJson,
          groceryJson,
          totalValueHighlight,
          bonusHighlight,
          footerNoticeTamil,
        ],
      });
    }

    await logAudit({
      userId: user?.id,
      action: "UPDATE_POSTER_CONFIG",
      entityType: "poster_config",
      entityId: schemeId,
      details: { titleTamil, totalValueHighlight },
    });

    return NextResponse.json({
      success: true,
      message: "Poster configuration updated successfully",
    });
  } catch (error: any) {
    console.error("Poster config save error:", error);
    return NextResponse.json({ error: "Failed to save poster config" }, { status: 500 });
  }
}
