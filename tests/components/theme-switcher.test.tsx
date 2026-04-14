import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSwitcher } from "@/components/theme-switcher";

const mockSetTheme = jest.fn();
let mockTheme = "light";

jest.mock("next-themes", () => ({
  useTheme: () => ({ theme: mockTheme, setTheme: mockSetTheme }),
}));

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTheme = "light";
  });

  it("renders the toggle button after mounting", () => {
    render(<ThemeSwitcher />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows Light, Dark, and System options when opened", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByText("Light")).toBeInTheDocument();
      expect(screen.getByText("Dark")).toBeInTheDocument();
      expect(screen.getByText("System")).toBeInTheDocument();
    });
  });

  it("calls setTheme with 'dark' when Dark is selected", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => screen.getByText("Dark"));
    await user.click(screen.getByText("Dark"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("calls setTheme with 'light' when Light is selected", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => screen.getByText("Light"));
    await user.click(screen.getByText("Light"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("calls setTheme with 'system' when System is selected", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => screen.getByText("System"));
    await user.click(screen.getByText("System"));
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });
});
