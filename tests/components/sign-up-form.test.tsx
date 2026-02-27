import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUpForm } from "@/components/sign-up-form";

// Mock Supabase client
const mockSignUp = jest.fn();
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
    },
  }),
}));

// Mock Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("SignUpForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows validation when submitting empty form", async () => {
    render(<SignUpForm />);
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("shows error when passwords do not match", async () => {
    render(<SignUpForm />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "password123");
    await userEvent.type(screen.getByLabelText(/repeat password/i), "different");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("calls signUp with correct credentials", async () => {
    mockSignUp.mockResolvedValue({ error: null });
    render(<SignUpForm />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "password123");
    await userEvent.type(screen.getByLabelText(/repeat password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: {
          emailRedirectTo: "http://localhost:3000/auth/login",
        },
      });
    });
  });

  it("redirects to /auth/sign-up-success on successful registration", async () => {
    mockSignUp.mockResolvedValue({ error: null });
    render(<SignUpForm />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "password123");
    await userEvent.type(screen.getByLabelText(/repeat password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/sign-up-success");
    });
  });

  it("displays error message on failed registration", async () => {
    mockSignUp.mockResolvedValue({ error: new Error("Email already in use") });
    render(<SignUpForm />);

    await userEvent.type(screen.getByLabelText(/email/i), "taken@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "password123");
    await userEvent.type(screen.getByLabelText(/repeat password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
    });
  });

  it("shows loading state while submitting", async () => {
    mockSignUp.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    );
    render(<SignUpForm />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "password123");
    await userEvent.type(screen.getByLabelText(/repeat password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(screen.getByRole("button", { name: /creating an account/i })).toBeDisabled();
  });
});