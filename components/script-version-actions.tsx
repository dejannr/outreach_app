"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createScriptVersionAction,
  setActiveScriptVersionAction,
} from "@/app/actions/scripts";
import { Button } from "@/components/ui/button";

export function ScriptVersionActions({
  versionId,
  isActive,
}: {
  versionId: string;
  isActive: boolean;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => {
          startTransition(async () => {
            const result = await createScriptVersionAction(versionId);
            if (!result.success) {
              toast.error(result.error || "Something went wrong");
              return;
            }
            toast.success(result.message || "New version created");
            router.refresh();
          });
        }}
      >
        Create new version
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={() => {
          startTransition(async () => {
            const result = await setActiveScriptVersionAction(versionId);
            if (!result.success) {
              toast.error(result.error || "Something went wrong");
              return;
            }
            toast.success(result.message || "Script set active");
            router.refresh();
          });
        }}
        disabled={isActive}
      >
        {isActive ? "Active version" : "Set active"}
      </Button>
    </div>
  );
}
