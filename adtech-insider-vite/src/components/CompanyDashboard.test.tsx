import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CompanyDashboard } from "./CompanyDashboard";
import { fixtureCompanies } from "@/test/fixtures";

describe("CompanyDashboard", () => {
  it("renders company name and tagline", () => {
    const company = fixtureCompanies[0];
    if (!company) throw new Error("fixture empty");

    render(
      <MemoryRouter>
        <CompanyDashboard company={company} allCompanies={fixtureCompanies} />
      </MemoryRouter>
    );

    expect(screen.getByText("Fixture Company")).toBeInTheDocument();
    expect(screen.getByText("Test tagline")).toBeInTheDocument();
  });

  it("renders KPI cards", () => {
    const company = fixtureCompanies[0];
    if (!company) throw new Error("fixture empty");

    render(
      <MemoryRouter>
        <CompanyDashboard company={company} allCompanies={fixtureCompanies} />
      </MemoryRouter>
    );

    expect(screen.getByText("Perception")).toBeInTheDocument();
    expect(screen.getByText("Intensity")).toBeInTheDocument();
    expect(screen.getByText("Composite")).toBeInTheDocument();
  });
});
