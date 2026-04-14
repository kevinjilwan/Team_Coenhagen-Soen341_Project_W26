import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SiteNavbar from "@/components/site-navbar";

const mockGetUser = jest.fn();
const mockSignOut = jest.fn();
const mockUnsubscribe = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      signOut: mockSignOut,
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      })),
    },
  }),
}));

const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

describe("SiteNavbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockSignOut.mockResolvedValue({});
  });

  it("renders Home and Account nav links", async () => {
    render(<SiteNavbar />);
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /account/i })).toBeInTheDocument();
  });

  it("opens the Recipes dropdown when clicked", async () => {
    render(<SiteNavbar />);
    await userEvent.click(screen.getByRole("button", { name: /recipes/i }));
    expect(screen.getByRole("link", { name: /my recipes/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create recipes/i })).toBeInTheDocument();
  });

  it("opens the Weekly Meal Plan dropdown when clicked", async () => {
    render(<SiteNavbar />);
    await userEvent.click(screen.getByRole("button", { name: /weekly meal plan/i }));
    expect(screen.getByRole("link", { name: /my weekly meal plans/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create weekly meal plan/i })).toBeInTheDocument();
  });

  it("shows Log in link when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    render(<SiteNavbar />);
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
    });
  });

  it("shows Log out button when user is authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "1234567890", email: "test@test.com" } } });
    render(<SiteNavbar />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
    });
  });
});
