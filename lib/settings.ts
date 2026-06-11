import { APP_SETTING_KEYS, DEFAULT_COMPANY_NAME, DEFAULT_DAILY_NEW_LEAD_LIMIT, DEFAULT_TIMEZONE, DEFAULT_USER_NAME, WORKING_DAYS_DEFAULT } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function getAppSettings() {
  const settings = await prisma.appSetting.findMany();
  const map = new Map(settings.map((item) => [item.key, item.value]));

  const activeScriptVersionId = map.get(APP_SETTING_KEYS.ACTIVE_SCRIPT_VERSION_ID);
  const dailyNewLeadLimit = map.get(APP_SETTING_KEYS.DAILY_NEW_LEAD_LIMIT);
  const userName = map.get(APP_SETTING_KEYS.USER_NAME);
  const companyName = map.get(APP_SETTING_KEYS.COMPANY_NAME);
  const defaultTimezone = map.get(APP_SETTING_KEYS.DEFAULT_TIMEZONE);
  const workingDays = map.get(APP_SETTING_KEYS.WORKING_DAYS);

  return {
    activeScriptVersionId:
      typeof activeScriptVersionId === "string" ? activeScriptVersionId : "",
    dailyNewLeadLimit:
      typeof dailyNewLeadLimit === "number"
        ? dailyNewLeadLimit
        : DEFAULT_DAILY_NEW_LEAD_LIMIT,
    userName: typeof userName === "string" ? userName : DEFAULT_USER_NAME,
    companyName:
      typeof companyName === "string" ? companyName : DEFAULT_COMPANY_NAME,
    defaultTimezone:
      typeof defaultTimezone === "string" ? defaultTimezone : DEFAULT_TIMEZONE,
    workingDays: Array.isArray(workingDays)
      ? workingDays.filter((day): day is string => typeof day === "string")
      : WORKING_DAYS_DEFAULT,
  };
}

export async function getDefaultUser() {
  return prisma.user.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });
}
