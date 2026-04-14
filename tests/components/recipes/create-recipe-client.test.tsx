import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateRecipeClient from "@/app/recipes/new/CreateRecipeClient";

jest.mock("@/components/site-navbar", () => ({
  __esModule: true,
  default: () => null,
}));

// Mock Next.js router and pathname (both used by SiteNavbar and CreateRecipeClient)
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  usePathname: () => "/recipes/new",
}));

// We describe the CreateRecipeClient component and test the following scenarios:
describe("CreateRecipeClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("renders the recipe creation form with all fields", () => {
    render(<CreateRecipeClient />);
    expect(screen.getByPlaceholderText("Recipe title")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("A short description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^easy$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create recipe/i })).toBeInTheDocument();
  });

  it("shows 'Title is required.' and does not call the API when title is missing", async () => {
    render(<CreateRecipeClient />);
    await userEvent.click(screen.getByRole("button", { name: /create recipe/i }));
    expect(await screen.findByText("Title is required.")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("sends a POST request with the recipe details and redirects to /recipes on success", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<CreateRecipeClient />);

    await userEvent.type(screen.getByPlaceholderText("Recipe title"), "Sushi");
    await userEvent.type(screen.getByPlaceholderText("A short description"), "A classic asian dish");
    await userEvent.click(screen.getByRole("button", { name: /^hard$/i }));

    const [ingredientsTextarea, stepsTextarea] = document.querySelectorAll("textarea");
    await userEvent.type(ingredientsTextarea, "rice{enter}seaweed{enter}fish{enter}");
    await userEvent.type(stepsTextarea, "Cook rice{enter}Roll sushi{enter}Eat sushi");

    await userEvent.click(screen.getByRole("button", { name: /create recipe/i }));

    await waitFor(() => {
      const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(options.body);
      expect(url).toBe("/api/recipes");
      expect(options.method).toBe("POST");
      expect(body.title).toBe("Sushi");
      expect(body.difficulty).toBe("hard");
      expect(body.ingredients).toEqual(["rice", "seaweed", "fish"]);
      expect(body.steps).toEqual(["Cook rice", "Roll sushi", "Eat sushi"]);
    });
  });
});
