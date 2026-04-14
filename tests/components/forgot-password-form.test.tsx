import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

const mockResetPassword = jest.fn();
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPassword,
    },
  }),
}));

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the reset password form initially", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByRole("button", { name: /send reset email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("does not call resetPasswordForEmail when email is empty", async () => {
    render(<ForgotPasswordForm />);
    await userEvent.click(screen.getByRole("button", { name: /send reset email/i }));
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it("shows success card after successful submission", async () => {
    mockResetPassword.mockResolvedValue({ error: null });
    render(<ForgotPasswordForm />);
    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
    await userEvent.click(screen.getByRole("button", { name: /send reset email/i }));
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  it("displays error message on failure", async () => {
    mockResetPassword.mockResolvedValue({ error: new Error("User not found") });
    render(<ForgotPasswordForm />);
    await userEvent.type(screen.getByLabelText(/email/i), "bad@example.com");
    await userEvent.click(screen.getByRole("button", { name: /send reset email/i }));
    await waitFor(() => {
      expect(screen.getByText(/user not found/i)).toBeInTheDocument();
    });
  });

  it("shows loading state while submitting", async () => {
    mockResetPassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    );
    render(<ForgotPasswordForm />);
    await userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
    await userEvent.click(screen.getByRole("button", { name: /send reset email/i }));
    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();
  });
});
