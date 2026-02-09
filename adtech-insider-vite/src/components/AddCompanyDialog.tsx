import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { parseCompanyJson } from "@/lib/parseCompanyJson";
import { useCompaniesStore } from "@/store/useCompaniesStore";

const LOGO_MAX_BYTES = 250 * 1024;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface AddCompanyDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddCompanyDialog({
  open,
  onClose,
  onSuccess,
}: AddCompanyDialogProps) {
  const [step, setStep] = useState<"json" | "logo" | "confirm">("json");
  const [pasteValue, setPasteValue] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [parsedBase, setParsedBase] = useState<ReturnType<typeof parseCompanyJson>["data"] | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const addCompany = useCompaniesStore((s) => s.addCompany);
  const navigate = useNavigate();

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const result = parseCompanyJson(text);
      if (result.success) {
        setParsedBase(result.data);
        setStep("logo");
      } else {
        setFileError(result.error);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const handlePasteImport = useCallback(() => {
    setFileError(null);
    if (!pasteValue.trim()) {
      setFileError("Paste JSON first.");
      return;
    }
    const result = parseCompanyJson(pasteValue);
    if (result.success) {
      setParsedBase(result.data);
      setStep("logo");
    } else {
      setFileError(result.error);
    }
  }, [pasteValue]);

  const handleLogoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setLogoError(null);
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setLogoError("Please upload an image file (PNG, JPEG, etc.).");
        return;
      }
      if (file.size > LOGO_MAX_BYTES) {
        setLogoError(`Image must be under ${LOGO_MAX_BYTES / 1024}KB.`);
        return;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        setLogoDataUrl(dataUrl);
      } catch {
        setLogoError("Failed to read image.");
      }
      e.target.value = "";
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (!parsedBase) return;
    const companyId = parsedBase.id;
    addCompany(parsedBase, { logoDataUrl: logoDataUrl ?? undefined });
    setStep("json");
    setParsedBase(null);
    setLogoDataUrl(null);
    setPasteValue("");
    setFileError(null);
    setLogoError(null);
    onSuccess?.();
    onClose();
    navigate(`/company/${companyId}`);
  }, [parsedBase, logoDataUrl, addCompany, onSuccess, onClose, navigate]);

  const handleBack = useCallback(() => {
    if (step === "logo") {
      setStep("json");
      setParsedBase(null);
      setLogoDataUrl(null);
    } else if (step === "confirm") {
      setStep("logo");
    }
  }, [step]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-background rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">
          {step === "json" && "Step A: Import JSON"}
          {step === "logo" && "Step B: Upload Logo (optional)"}
          {step === "confirm" && "Step C: Confirm & Add"}
        </h2>

        {step === "json" && (
          <>
            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium">Upload file</label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-sm"
              />
            </div>
            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium">Or paste JSON</label>
              <textarea
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
                placeholder='{"id":"new-company","name":"Company Name",...}'
                className="w-full rounded border border-border p-2 text-sm font-mono min-h-[120px]"
              />
            </div>
            {fileError && <p className="text-sm text-red-600 mb-4">{fileError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePasteImport}
                className="rounded bg-primary text-primary-foreground px-4 py-2 text-sm"
              >
                Import from paste
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {step === "logo" && parsedBase && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Adding <strong>{parsedBase.name}</strong>. Upload a logo or skip.
            </p>
            <div className="space-y-2 mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full text-sm"
              />
              {logoDataUrl && (
                <img
                  src={logoDataUrl}
                  alt="Logo preview"
                  className="w-16 h-16 rounded object-contain border"
                />
              )}
              {logoError && <p className="text-sm text-red-600">{logoError}</p>}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("confirm")}
                className="rounded bg-primary text-primary-foreground px-4 py-2 text-sm"
              >
                {logoDataUrl ? "Next" : "Skip & Next"}
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="rounded border border-border px-4 py-2 text-sm"
              >
                Back
              </button>
            </div>
          </>
        )}

        {step === "confirm" && parsedBase && (
          <>
            <p className="text-sm mb-4">
              Add <strong>{parsedBase.name}</strong>?
              {logoDataUrl && " Logo will be saved."}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded bg-primary text-primary-foreground px-4 py-2 text-sm"
              >
                Confirm & Add
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="rounded border border-border px-4 py-2 text-sm"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
