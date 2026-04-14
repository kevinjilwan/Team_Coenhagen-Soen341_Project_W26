import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogoutButton } from "@/components/logout-button";

const mockSignOut = jest.fn();
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignOut.mockResolvedValue({});
  });

  it("renders a Logout button", () => {
    render(<LogoutButton />);
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("calls signOut when clicked", async () => {
    render(<LogoutButton />);
    await userEvent.click(screen.getByRole("button", { name: /logout/i }));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("redirects to /auth/login after logout", async () => {
    render(<LogoutButton />);
    await userEvent.click(screen.getByRole("button", { name: /logout/i }));
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });
});
