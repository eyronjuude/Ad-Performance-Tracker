"use client";

import * as React from "react";
import { useCallback, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSettings } from "@/components/SettingsProvider";
import { useSettingsNavigationGuard } from "@/hooks/useSettingsNavigationGuard";

/**
 * When on Settings page with unsaved changes, intercepts navigation
 * (link clicks, back button, close/refresh) and shows a confirmation dialog.
 */
export function SettingsNavigationGuard(): React.ReactElement | null {
  const { isDirty, revert } = useSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const resolveRef = useRef<(value: boolean) => void | null>(null);

  const showConfirmDialog = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialogOpen(true);
    });
  }, []);

  const handleDialogClose = useCallback((confirmed: boolean) => {
    setDialogOpen(false);
    resolveRef.current?.(confirmed);
    resolveRef.current = null;
  }, []);

  useSettingsNavigationGuard({
    isDirty,
    onConfirmLeave: revert,
    showConfirmDialog,
  });

  return (
    <AlertDialog
      open={dialogOpen}
      onOpenChange={(open) => !open && handleDialogClose(false)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to leave? You will lose unsaved changes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => handleDialogClose(false)}>
            No, stay
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDialogClose(true)}>
            Yes, leave
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
