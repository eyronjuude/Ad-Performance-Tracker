import type { ReactElement } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsProvider } from "@/components/SettingsProvider";
import SettingsPage from "../page";
import { fetchSettings } from "@/lib/settings-api";
import { getDefaultSettings } from "@/lib/settings";

vi.mock("@/lib/settings-api", () => ({
  fetchSettings: vi.fn(),
  saveSettingsApi: vi.fn().mockImplementation(async (settings) => settings),
}));

function renderWithProvider(ui: ReactElement) {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
}

beforeEach(() => {
  vi.mocked(fetchSettings).mockResolvedValue(getDefaultSettings());
});

describe("Settings page", () => {
  it("renders the Settings heading", async () => {
    renderWithProvider(<SettingsPage />);
    expect(
      await screen.findByRole("heading", { name: /Settings/i })
    ).toBeInTheDocument();
  });

  it("renders employee mapping section", async () => {
    renderWithProvider(<SettingsPage />);
    expect(
      await screen.findByRole("heading", { name: /Employee mapping/i })
    ).toBeInTheDocument();
  });

  it("renders spend and cROAS evaluation sections", async () => {
    renderWithProvider(<SettingsPage />);
    expect(
      await screen.findByText(/Spend evaluation thresholds/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/cROAS evaluation thresholds/i)
    ).toBeInTheDocument();
  });

  it("threshold sections have no Remove or Add threshold buttons", async () => {
    renderWithProvider(<SettingsPage />);
    const spendHeading = await screen.findByRole("heading", {
      name: /Spend evaluation thresholds/i,
    });
    const spendSection = spendHeading.closest("section");

    const croasHeading = screen.getByRole("heading", {
      name: /cROAS evaluation thresholds/i,
    });
    const croasSection = croasHeading.closest("section");
    if (spendSection) {
      expect(
        within(spendSection).queryByRole("button", { name: /Remove/i })
      ).not.toBeInTheDocument();
    }
    if (croasSection) {
      expect(
        within(croasSection).queryByRole("button", { name: /Remove/i })
      ).not.toBeInTheDocument();
    }
    expect(
      screen.queryByRole("button", { name: /Add threshold/i })
    ).not.toBeInTheDocument();
  });

  it("shows three threshold intervals (Red, Yellow, Green) per evaluation type", async () => {
    renderWithProvider(<SettingsPage />);
    const descriptions = await screen.findAllByText(
      /Three intervals \(Red, Yellow, Green\)/i
    );
    expect(descriptions).toHaveLength(2);
  });

  it("renders employee status selectors defaulting to Tenured", async () => {
    renderWithProvider(<SettingsPage />);
    const triggers = await screen.findAllByLabelText(/Employee status/i);
    expect(triggers.length).toBeGreaterThan(0);
    for (const trigger of triggers) {
      expect(trigger).toHaveTextContent(/Tenured employee/i);
    }
  });

  it("Start date and Review date pickers are disabled for tenured employees", async () => {
    renderWithProvider(<SettingsPage />);
    const startPickers = await screen.findAllByLabelText(/Start date/i);
    const reviewPickers = await screen.findAllByLabelText(/Review date/i);
    for (const picker of [...startPickers, ...reviewPickers]) {
      expect(picker).toBeDisabled();
    }
  });

  it("Start date and Review date pickers are enabled when status is changed to probationary", async () => {
    const user = userEvent.setup();
    renderWithProvider(<SettingsPage />);
    const triggers = await screen.findAllByLabelText(/Employee status/i);
    await user.click(triggers[0]);
    const option = await screen.findByRole("option", {
      name: /Probationary employee/i,
    });
    await user.click(option);

    const startPickers = screen.getAllByLabelText(/Start date/i);
    const reviewPickers = screen.getAllByLabelText(/Review date/i);
    expect(startPickers[0]).toBeEnabled();
    expect(reviewPickers[0]).toBeEnabled();
  });

  it("shows skeleton while settings are loading", () => {
    vi.mocked(fetchSettings).mockReturnValue(new Promise(() => {}));

    renderWithProvider(<SettingsPage />);

    expect(screen.getByTestId("settings-skeleton")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /Settings/i })
    ).not.toBeInTheDocument();
  });

  it("displays spend thresholds with $ and thousand separators", async () => {
    renderWithProvider(<SettingsPage />);
    await screen.findByRole("heading", {
      name: /Spend evaluation thresholds/i,
    });

    const minInputs = screen.getAllByLabelText(/Minimum value/i);
    const spendMinInput = minInputs[2]; // At least one spend min (red: 0–10,000)
    expect(spendMinInput).toHaveValue("$0");

    const maxInputs = screen.getAllByLabelText(
      /Maximum value.*empty for no cap/i
    );
    const spendMaxInput = maxInputs[2]; // Red row max
    expect(spendMaxInput).toHaveValue("$10,000");
  });

  it("accepts zero in spend min input", async () => {
    const user = userEvent.setup();
    renderWithProvider(<SettingsPage />);
    await screen.findByRole("heading", {
      name: /Spend evaluation thresholds/i,
    });

    const minInputs = screen.getAllByLabelText(/Minimum value/i);
    const spendMinInput = minInputs[2];
    await user.clear(spendMinInput);
    await user.type(spendMinInput, "0");

    expect(spendMinInput).toHaveValue("$0");
  });

  it("accepts zero in cROAS min and max inputs", async () => {
    const user = userEvent.setup();
    renderWithProvider(<SettingsPage />);
    await screen.findByRole("heading", {
      name: /cROAS evaluation thresholds/i,
    });

    const minInputs = screen.getAllByLabelText(/Minimum value/i);
    const maxInputs = screen.getAllByLabelText(
      /Maximum value.*empty for no cap/i
    );
    const croasMinInput = minInputs[3]; // First cROAS min
    const croasMaxInput = maxInputs[3]; // First cROAS max

    await user.clear(croasMinInput);
    await user.type(croasMinInput, "0");
    expect(croasMinInput).toHaveValue(0);

    await user.clear(croasMaxInput);
    await user.type(croasMaxInput, "0");
    expect(croasMaxInput).toHaveValue(0);
  });

  it("shows Save button when settings are changed", async () => {
    const user = userEvent.setup();
    renderWithProvider(<SettingsPage />);
    await screen.findByRole("heading", { name: /Settings/i });

    expect(
      screen.queryByRole("button", { name: /Save/i })
    ).not.toBeInTheDocument();

    const acronymInputs = screen.getAllByPlaceholderText("Acronym");
    await user.clear(acronymInputs[0]);
    await user.type(acronymInputs[0], "X");

    expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
  });

  it("subtitle mentions clicking Save to persist changes", async () => {
    renderWithProvider(<SettingsPage />);
    await screen.findByRole("heading", { name: /Settings/i });

    expect(
      screen.getByText(/Click Save to persist changes/i)
    ).toBeInTheDocument();
  });

  it("calls saveSettingsApi when Save is clicked", async () => {
    const { saveSettingsApi } = await import("@/lib/settings-api");
    const user = userEvent.setup();
    renderWithProvider(<SettingsPage />);
    await screen.findByRole("heading", { name: /Settings/i });

    const acronymInputs = screen.getAllByPlaceholderText("Acronym");
    await user.clear(acronymInputs[0]);
    await user.type(acronymInputs[0], "X");

    const saveButton = screen.getByRole("button", { name: /Save/i });
    await user.click(saveButton);

    expect(saveSettingsApi).toHaveBeenCalled();
  });
});
