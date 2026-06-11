import type { Lead } from "@prisma/client";

import {
  DEFAULT_COMPANY_NAME,
  DEFAULT_USER_NAME,
} from "@/lib/constants";

export function renderScriptText(
  template: string,
  lead: Pick<Lead, "companyName" | "contactName" | "email" | "phone">,
  settings?: Record<string, string>,
) {
  const replacements: Record<string, string> = {
    contactName: lead.contactName?.trim() || "there",
    companyName: lead.companyName?.trim() || "your company",
    email: lead.email?.trim() || "",
    phone: lead.phone?.trim() || "",
    userName: settings?.userName?.trim() || DEFAULT_USER_NAME,
    companySenderName:
      settings?.companySenderName?.trim() || DEFAULT_COMPANY_NAME,
  };

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return replacements[key] ?? "";
  });
}
