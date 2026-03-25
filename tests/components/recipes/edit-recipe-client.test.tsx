import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditRecipeClient from "@/app/recipes/[id]/edit/EditRecipeClient";

const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

const mockRecipe = {
  id: "1234567890",
  title: "Classic Sushi Roll",
  description: "A classic asian dish",
  ingredients: ["rice", "seaweed", "fish"],
  preparation_steps: ["Cook rice", "Roll sushi", "Eat sushi"],
  preparation_time: 20,
  cost: 10,
  difficulty: "medium",
  dietary_tags: [],
};

describe("EditRecipeClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("populates the form with the existing recipe data on load", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ recipe: mockRecipe }),
    });

    render(<EditRecipeClient id="1234567890" />);

    expect(await screen.findByDisplayValue("Classic Sushi Roll")).toBeInTheDocument();
    expect(screen.getByDisplayValue("A classic asian dish")).toBeInTheDocument();
  });

  it("sends a PATCH request with updated data and redirects to /recipes on save", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ recipe: mockRecipe }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<EditRecipeClient id="1234567890" />);

    const titleInput = await screen.findByDisplayValue("Classic Sushi Roll");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "California Roll");

    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      const [url, options] = (global.fetch as jest.Mock).mock.calls[1];
      const body = JSON.parse(options.body);
      expect(url).toBe("/api/recipes/1234567890");
      expect(options.method).toBe("PATCH");
      expect(body.title).toBe("California Roll");
      expect(mockPush).toHaveBeenCalledWith("/recipes");
    });
  });

  it("shows an error message when saving fails", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ recipe: mockRecipe }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Update failed." }) });

    render(<EditRecipeClient id="1234567890" />);

    await screen.findByDisplayValue("Classic Sushi Roll");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText("Update failed.")).toBeInTheDocument();
  });
});
