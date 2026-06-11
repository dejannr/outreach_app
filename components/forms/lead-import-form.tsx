"use client";

import { startTransition, useState } from "react";
import { parse } from "csv-parse/sync";
import { toast } from "sonner";

import { importLeads } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function LeadImportForm() {
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<Record<string, string>[]>([]);

  return (
    <div className="space-y-4">
      <Textarea
        value={csv}
        onChange={(event) => setCsv(event.target.value)}
        placeholder="companyName,contactName,email,phone,role,website,source"
        className="min-h-56"
      />
      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            try {
              const rows = parse(csv, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
              }) as Record<string, string>[];
              setPreview(rows);
            } catch {
              toast.error("Invalid CSV");
            }
          }}
        >
          Preview import
        </Button>
        <Button
          type="button"
          onClick={() => {
            startTransition(async () => {
              const result = await importLeads({ csv });
              if (!result.success) {
                toast.error("Something went wrong");
                return;
              }
              toast.success(result.message);
              setCsv("");
              setPreview([]);
            });
          }}
        >
          Import valid rows
        </Button>
      </div>
      {preview.length ? (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--card-strong)]">
              <tr>
                {Object.keys(preview[0]).map((key) => (
                  <th key={key} className="px-4 py-3 font-semibold">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, index) => (
                <tr key={index} className="border-t">
                  {Object.keys(preview[0]).map((key) => (
                    <td key={key} className="px-4 py-3">
                      {row[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
