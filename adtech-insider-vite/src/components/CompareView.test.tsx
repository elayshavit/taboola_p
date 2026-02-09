import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CompareView } from "./CompareView";
import { fixtureCompanies } from "@/test/fixtures";

describe("CompareView", () => {
  it("renders compare heading", () => {
    render(
      <MemoryRouter>
        <CompareView companies={fixtureCompanies} />
      </MemoryRouter>
    );

    expect(screen.getByText("Compare Companies")).toBeInTheDocument();
  });

  it("renders normalized metrics chart section", () => {
    render(
      <MemoryRouter>
        <CompareView companies={fixtureCompanies} />
      </MemoryRouter>
    );

    expect(screen.getByText("Normalized metrics")).toBeInTheDocument();
    expect(screen.getByText("Ranked by perception")).toBeInTheDocument();
  });
});
