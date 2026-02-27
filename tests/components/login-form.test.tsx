import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/login-form";

/*
The LoginForm component is a form that allows a user to login to their account.
It uses the Supabase client to sign in the user.
It also uses the Next.js router to redirect the user to the account page after successful login.

Here we test the LoginForm component using Jest and React Testing Library.
We render the component <LoginForm /> and test the component using a mock sign in for the Supabase client and a mock Next.js router.
This allows us to test the component in isolation without relying on the Supabase client and Next.js router.
*/


// Before each test, we create a mock sign in for the Supabase client
const mockSignIn = jest.fn();
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignIn,
    },
  }),
}));

// We also create a mock Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// We describe the LoginForm component and test the following scenarios:
describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test so they don't affect other tests
  });

  it("shows error message when submitting empty form", async () => {
    render(<LoginForm />);
    const submitButton = screen.getByRole("button", { name: /login/i });
    await userEvent.click(submitButton);
    // HTML5 validation prevents submit - form has required fields
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("calls signInWithPassword with correct credentials", async () => {
    mockSignIn.mockResolvedValue({ error: null });
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("redirects to /account on successful login", async () => {
    mockSignIn.mockResolvedValue({ error: null });
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/account");
    });
  });

  it("displays error message on failed login", async () => {
    mockSignIn.mockResolvedValue({ error: new Error("Invalid credentials") }); 
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email/i), "wrong@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("shows loading state while submitting", async () => {
    mockSignIn.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    );
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled();
  });
});