import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompaniesStore } from "@/store/useCompaniesStore";
import { CompanyLogo } from "./CompanyLogo";

interface ManageCompaniesDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ManageCompaniesDialog({
  open,
  onClose,
}: ManageCompaniesDialogProps) {
  const companies = useCompaniesStore((s) => s.companies);
  const removeCompany = useCompaniesStore((s) => s.removeCompany);
  const resetImported = useCompaniesStore((s) => s.resetImported);
  const navigate = useNavigate();
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleRemove = (id: string, name: string) => {
    if (confirmRemove === id) {
      const removed = removeCompany(id);
      if (removed) {
        setToast("Removed company.");
        setConfirmRemove(null);
        const path = window.location.pathname;
        if (path.startsWith("/company/") && path.endsWith(id)) {
          navigate("/compare");
        }
        setTimeout(() => setToast(null), 2000);
      }
      onClose();
    } else {
      setConfirmRemove(id);
    }
  };

  const handleResetImported = () => {
    if (window.confirm("Reset all imported companies? Seed companies will remain.")) {
      resetImported();
      setToast("Reset imported companies.");
      const path = window.location.pathname;
      if (path.startsWith("/company/")) {
        const id = path.split("/").pop();
        const isSeed = ["taboola", "teads", "the-trade-desk", "simpli-fi"].includes(id ?? "");
        if (!isSeed) navigate("/compare");
      }
      setTimeout(() => setToast(null), 2000);
      onClose();
    }
  };

  if (!open) return null;

  const imported = companies.filter((c) => c.source === "imported");
  const hasImported = imported.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-background rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Manage Companies</h2>

        {toast && (
          <p className="text-sm text-green-600 mb-4 p-2 rounded bg-green-50">
            {toast}
          </p>
        )}

        <ul className="space-y-3 mb-6">
          {companies.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-4 p-3 rounded border border-border"
            >
              <div className="flex items-center gap-3 min-w-0">
                <CompanyLogo company={c} size="sm" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.id}</p>
                </div>
              </div>
              <div>
                {confirmRemove === c.id ? (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">
                      Remove {c.name}? This will delete imported data + its logo from this device.
                    </p>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemove(c.id, c.name)}
                        className="text-sm text-red-600 font-medium"
                      >
                        Yes, remove
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRemove(null)}
                        className="text-sm text-muted-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(c.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

        {hasImported && (
          <button
            type="button"
            onClick={handleResetImported}
            className="rounded border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            Reset imported companies
          </button>
        )}

        <div className="mt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-primary text-primary-foreground px-4 py-2 text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
