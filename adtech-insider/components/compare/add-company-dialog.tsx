"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompaniesStore } from "@/store/use-companies-store";
import { toast } from "sonner";

interface AddCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCompanyDialog({ open, onOpenChange }: AddCompanyDialogProps) {
  const [pasteValue, setPasteValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const addCompanies = useCompaniesStore((s) => s.addCompanies);
  const addMockCompany = useCompaniesStore((s) => s.addMockCompany);

  const handlePasteImport = useCallback(() => {
    setError(null);
    if (!pasteValue.trim()) {
      setError("Paste JSON first.");
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(pasteValue);
    } catch {
      setError("Invalid JSON. Check syntax.");
      return;
    }
    const input = Array.isArray(parsed) ? parsed : typeof parsed === "object" && parsed !== null && "companies" in parsed ? parsed : { companies: [parsed] };
    const result = addCompanies(input);
    if (result.success) {
      const companies = useCompaniesStore.getState().companies;
      const slug = companies?.at(-1)?.slug ?? companies?.at(-1)?.id;
      toast.success("Company added.");
      setPasteValue("");
      onOpenChange(false);
      if (slug) router.push(`/company/${slug}`);
    } else {
      setError(result.error);
    }
  }, [pasteValue, addCompanies, onOpenChange, router]);

  const handleFileImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch {
          setError("Invalid JSON in file.");
          return;
        }
        const input = Array.isArray(parsed) ? parsed : typeof parsed === "object" && parsed !== null && "companies" in parsed && Array.isArray((parsed as { companies: unknown }).companies) ? parsed : { companies: [parsed] };
        const result = addCompanies(input);
        if (result.success) {
          const companies = useCompaniesStore.getState().companies;
          const slug = companies?.at(-1)?.slug ?? companies?.at(-1)?.id;
          toast.success("Company added.");
          onOpenChange(false);
          if (slug) router.push(`/company/${slug}`);
        } else {
          setError(result.error);
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [addCompanies, onOpenChange, router]
  );

  const handleAddMock = useCallback(() => {
    const seed = Math.floor(Date.now() / 1000) % 100000;
    addMockCompany(seed);
    toast.success("Mock company added.");
    onOpenChange(false);
  }, [addMockCompany, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Add Company</DialogTitle>
          <DialogDescription>Import from JSON or add a mock company.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import JSON</TabsTrigger>
            <TabsTrigger value="mock">Add Mock</TabsTrigger>
          </TabsList>
          <TabsContent value="import" className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">Upload file</label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:rounded file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:text-primary-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Or paste JSON</label>
              <textarea
                value={pasteValue}
                onChange={(e) => {
                  setPasteValue(e.target.value);
                  setError(null);
                }}
                placeholder='{"id":"new-co","name":"New Co",...} or {"companies":[...]}'
                className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm min-h-[120px] font-mono"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handlePasteImport}>Import from paste</Button>
          </TabsContent>
          <TabsContent value="mock" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Add a deterministic mock company with 4 quarters and sample data.
            </p>
            <Button onClick={handleAddMock}>
              <Sparkles className="mr-2 h-4 w-4" />
              Add mock company
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
