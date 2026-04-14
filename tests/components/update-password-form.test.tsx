import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UpdatePasswordForm } from "@/components/update-password-form";

const mockUpdateUser = jest.fn();
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      updateUser: mockUpdateUser,
    },
  }),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("UpdatePasswordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the password input and submit button", () => {
    render(<UpdatePasswordForm />);
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save new password/i })).toBeInTheDocument();
  });

  it("calls updateUser with the entered password on submit", async () => {
    mockUpdateUser.mockResolvedValue({ error: null });
    render(<UpdatePasswordForm />);
    await userEvent.type(screen.getByLabelText(/new password/i), "testpass");
    await userEvent.click(screen.getByRole("button", { name: /save new password/i }));
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: "testpass" });
    });
  });

  it("redirects to /protected on successful update", async () => {
    mockUpdateUser.mockResolvedValue({ error: null });
    render(<UpdatePasswordForm />);
    await userEvent.type(screen.getByLabelText(/new password/i), "testpass");
    await userEvent.click(screen.getByRole("button", { name: /save new password/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/protected");
    });
  });

  it("displays error message on failure", async () => {
    mockUpdateUser.mockResolvedValue({ error: new Error("Password too short") });
    render(<UpdatePasswordForm />);
    await userEvent.type(screen.getByLabelText(/new password/i), "qwerty");
    await userEvent.click(screen.getByRole("button", { name: /save new password/i }));
    await waitFor(() => {
      expect(screen.getByText(/password too short/i)).toBeInTheDocument();
    });
  });

  it("shows loading state while submitting", async () => {
    mockUpdateUser.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    );
    render(<UpdatePasswordForm />);
    await userEvent.type(screen.getByLabelText(/new password/i), "testpass");
    await userEvent.click(screen.getByRole("button", { name: /save new password/i }));
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });
});
