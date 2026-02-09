import { useEffect, useState } from "react";
import { Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { useCompaniesStore } from "@/store/useCompaniesStore";
import { CompanyDashboard } from "@/components/CompanyDashboard";
import { CompareView } from "@/components/CompareView";
import { AddCompanyDialog } from "@/components/AddCompanyDialog";
import { ManageCompaniesDialog } from "@/components/ManageCompaniesDialog";
import { CompanyLogo } from "@/components/CompanyLogo";

function Layout({
  children,
  addOpen,
  setAddOpen,
}: {
  children: React.ReactNode;
  addOpen: boolean;
  setAddOpen: (v: boolean) => void;
}) {
  const companies = useCompaniesStore((s) => s.companies);
  const [manageOpen, setManageOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col lg:flex-row">
        <nav className="lg:w-48 border-b lg:border-b-0 lg:border-r border-border p-4 flex flex-col">
          <Link
            to="/company/taboola"
            className="flex items-center gap-3 font-semibold mb-4 hover:opacity-90"
          >
            <img src="/logo.svg" alt="AdTech Insider" width="36" height="36" className="shrink-0 rounded-lg" />
            <span>AdTech Insider</span>
          </Link>
          <ul className="space-y-2 flex-1">
            {companies.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/company/${c.id}`}
                  className="flex items-center gap-2 text-sm hover:underline"
                >
                  <CompanyLogo company={c} size="sm" />
                  <span className="truncate">{c.name}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link to="/compare" className="text-sm hover:underline">
                Compare
              </Link>
            </li>
          </ul>
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="w-full text-left text-sm text-primary hover:underline"
            >
              Add Company
            </button>
            <button
              type="button"
              onClick={() => setManageOpen(true)}
              className="w-full text-left text-sm text-muted-foreground hover:underline"
            >
              Manage Companies
            </button>
          </div>
        </nav>
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>

      <AddCompanyDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
      <ManageCompaniesDialog
        open={manageOpen}
        onClose={() => setManageOpen(false)}
      />
    </div>
  );
}

function Home() {
  const companies = useCompaniesStore((s) => s.companies);
  const first = companies[0];
  if (!first) return <p>No companies. Add a company from Compare.</p>;
  return <CompanyDashboard company={first} allCompanies={companies} />;
}

function CompanyPage() {
  const { id } = useParams<{ id: string }>();
  const companies = useCompaniesStore((s) => s.companies);
  const isHydrated = useCompaniesStore((s) => s.isHydrated);
  const navigate = useNavigate();
  const company = companies.find((c) => c.id === id);

  if (!isHydrated) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-4 w-96 rounded bg-muted" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="rounded-lg border border-border p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-2">Company not found</h2>
        <p className="text-muted-foreground text-sm mb-4">
          No company with id &quot;{id}&quot; was found.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={() => navigate("/compare")}
            className="rounded bg-primary text-primary-foreground px-4 py-2 text-sm"
          >
            Back to Compare
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded border border-border px-4 py-2 text-sm"
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <CompanyDashboard company={company} allCompanies={companies} />
  );
}

function ComparePage({ setAddOpen }: { setAddOpen: (v: boolean) => void }) {
  const companies = useCompaniesStore((s) => s.companies);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span />
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="rounded bg-primary text-primary-foreground px-4 py-2 text-sm"
        >
          Add Company
        </button>
      </div>
      <CompareView companies={companies} />
    </div>
  );
}

export default function App() {
  const hydrate = useCompaniesStore((s) => s.hydrate);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Layout addOpen={addOpen} setAddOpen={setAddOpen}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/company/:id" element={<CompanyPage />} />
        <Route path="/compare" element={<ComparePage setAddOpen={setAddOpen} />} />
      </Routes>
    </Layout>
  );
}
