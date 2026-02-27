import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccountClient from "@/app/account/AccountClient";

const mockUpsert = jest.fn();
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      upsert: mockUpsert,
    }),
  }),
}));

const defaultProps = {
  userId: "123123123",
  initialProfile: { full_name: "Adam Sandler", phone: "514-100-2000" },
  initialPreferences: {
    allergies: [],
    diet_focus: "balanced" as const,
    lactose_intolerant: false,
  },
};

describe("AccountClient", () => {
  beforeEach(() => jest.clearAllMocks());

  // --- Account Info ---

  // Test that the initial profile values are rendered correctly
  it("renders initial profile values", () => {
    render(<AccountClient {...defaultProps} />);
    expect(screen.getByDisplayValue("Adam Sandler")).toBeInTheDocument();
    expect(screen.getByDisplayValue("514-100-2000")).toBeInTheDocument();
  });

  // Test that the profile info is saved correctly
  it("saves profile info with correct data", async () => {
    mockUpsert.mockResolvedValue({ error: null });
    render(<AccountClient {...defaultProps} />);

    await userEvent.clear(screen.getByLabelText(/full name/i));
    await userEvent.type(screen.getByLabelText(/full name/i), "Bob L'Eponge");
    await userEvent.click(screen.getAllByRole("button", { name: /^save$/i })[0]);

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ full_name: "Bob L'Eponge", user_id: "123123123" }),
        expect.anything()
      );
    });
  });

  // Test that the Saved! message is displayed after successful profile save
  it("shows Saved! after successful profile save", async () => {
    mockUpsert.mockResolvedValue({ error: null });
    render(<AccountClient {...defaultProps} />);

    await userEvent.click(screen.getAllByRole("button", { name: /^save$/i })[0]);

    await waitFor(() => {
      expect(screen.getByText("Saved!")).toBeInTheDocument();
    });
  });

  // Test that the error message is displayed after failed profile save
  it("shows error message on failed profile save", async () => {
    mockUpsert.mockResolvedValue({ error: { message: "DB error" } });
    render(<AccountClient {...defaultProps} />);

    await userEvent.click(screen.getAllByRole("button", { name: /^save$/i })[0]);

    await waitFor(() => {
      expect(screen.getByText("DB error")).toBeInTheDocument();
    });
  });


  // --- My Preferences ---

  it("renders initial diet focus", () => {
    render(<AccountClient {...defaultProps} />);
    // "balanced" button should appear as the active/default selection
    expect(screen.getByRole("button", { name: /balanced/i })).toBeInTheDocument();
  });

  // Test that the diet focus is changed when a button is clicked
  it("changes diet focus when a button is clicked", async () => {
    render(<AccountClient {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: /protein/i }));
    // after clicking, saving should send protein as diet_focus
    mockUpsert.mockResolvedValue({ error: null });
    await userEvent.click(screen.getAllByRole("button", { name: /^save$/i })[1]);

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ diet_focus: "protein" }),
        expect.anything()
      );
    });
  });

  // Test that the lactose intolerant checkbox is toggled when clicked
  it("toggles lactose intolerant checkbox", async () => {
    render(<AccountClient {...defaultProps} />);
    const checkbox = screen.getByLabelText(/lactose intolerant/i);
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  // Test that the preferences are saved correctly
  it("saves preferences with correct data", async () => {
    mockUpsert.mockResolvedValue({ error: null });
    render(<AccountClient {...defaultProps} />);

    await userEvent.click(screen.getAllByRole("button", { name: /^save$/i })[1]);

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "123123123",
          diet_focus: "balanced",
          lactose_intolerant: false,
        }),
        expect.anything()
      );
    });
  });
});