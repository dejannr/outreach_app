"use server";

import { revalidatePath } from "next/cache";

import { APP_SETTING_KEYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/settings";
import { settingsSchema } from "@/lib/validations";

export async function updateSettingsAction(input: unknown) {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid settings.", message: undefined };
  }

  const user = await getDefaultUser();

  await Promise.all([
    prisma.appSetting.upsert({
      where: { key: APP_SETTING_KEYS.ACTIVE_SCRIPT_VERSION_ID },
      update: { value: parsed.data.activeScriptVersionId },
      create: {
        key: APP_SETTING_KEYS.ACTIVE_SCRIPT_VERSION_ID,
        value: parsed.data.activeScriptVersionId,
      },
    }),
    prisma.appSetting.upsert({
      where: { key: APP_SETTING_KEYS.DAILY_NEW_LEAD_LIMIT },
      update: { value: parsed.data.dailyNewLeadLimit },
      create: {
        key: APP_SETTING_KEYS.DAILY_NEW_LEAD_LIMIT,
        value: parsed.data.dailyNewLeadLimit,
      },
    }),
    prisma.appSetting.upsert({
      where: { key: APP_SETTING_KEYS.USER_NAME },
      update: { value: parsed.data.userName },
      create: {
        key: APP_SETTING_KEYS.USER_NAME,
        value: parsed.data.userName,
      },
    }),
    prisma.appSetting.upsert({
      where: { key: APP_SETTING_KEYS.COMPANY_NAME },
      update: { value: parsed.data.companyName },
      create: {
        key: APP_SETTING_KEYS.COMPANY_NAME,
        value: parsed.data.companyName,
      },
    }),
    prisma.appSetting.upsert({
      where: { key: APP_SETTING_KEYS.DEFAULT_TIMEZONE },
      update: { value: parsed.data.defaultTimezone },
      create: {
        key: APP_SETTING_KEYS.DEFAULT_TIMEZONE,
        value: parsed.data.defaultTimezone,
      },
    }),
    prisma.appSetting.upsert({
      where: { key: APP_SETTING_KEYS.WORKING_DAYS },
      update: { value: parsed.data.workingDays },
      create: {
        key: APP_SETTING_KEYS.WORKING_DAYS,
        value: parsed.data.workingDays,
      },
    }),
    user
      ? prisma.user.update({
          where: { id: user.id },
          data: { name: parsed.data.userName },
        })
      : Promise.resolve(),
  ]);

  revalidatePath("/settings");
  revalidatePath("/start-working");
  return { success: true, message: "Settings saved", error: undefined };
}
