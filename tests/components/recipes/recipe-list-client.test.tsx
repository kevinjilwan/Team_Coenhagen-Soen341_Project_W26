import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecipeListClient, { RecipeListItem } from "@/app/recipes/RecipeListClient";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/recipes",
}));

const mockRecipes: RecipeListItem[] = [
  { id: "1", title: "Sushi", description: null, ingredients: ["rice", "fish"], dietary_tags: null, preparation_time: null, difficulty: null, cost: null },
  { id: "2", title: "Fried Chicken", description: null, ingredients: ["chicken", "flour"], dietary_tags: null, preparation_time: null, difficulty: null, cost: null },
  { id: "3", title: "Pizza", description: null, ingredients: ["dough", "cheese", "tomato"], dietary_tags: null, preparation_time: null, difficulty: null, cost: null },
];

describe("RecipeListClient", () => {
  it("displays matching recipes when the user enters a valid search query", async () => {
    render(<RecipeListClient initialItems={mockRecipes} />);

    await userEvent.type(screen.getByRole("textbox", { name: /search recipes/i }), "sushi");

    expect(screen.getByText("Sushi")).toBeInTheDocument();
    expect(screen.queryByText("Fried Chicken")).not.toBeInTheDocument();
    expect(screen.queryByText("Pizza")).not.toBeInTheDocument();
    expect(screen.getByText(/1 of 3 recipes/i)).toBeInTheDocument();
  });

  it("shows a 'No recipes found' message when the search query matches nothing", async () => {
    render(<RecipeListClient initialItems={mockRecipes} />);

    await userEvent.type(
      screen.getByRole("textbox", { name: /search recipes/i }),
      "qwertyasdfghzxcvbn"
    );

    expect(screen.getByText(/no recipes found/i)).toBeInTheDocument();
    expect(screen.getByText(/0 of 3 recipes/i)).toBeInTheDocument();
  });

  it("links each recipe result to its details page", async () => {
    render(<RecipeListClient initialItems={mockRecipes} />);

    const editLinks = screen.getAllByRole("link", { name: /edit/i });
    expect(editLinks).toHaveLength(mockRecipes.length);

    expect(editLinks[0]).toHaveAttribute("href", "/recipes/1/edit");
    expect(editLinks[1]).toHaveAttribute("href", "/recipes/2/edit");
    expect(editLinks[2]).toHaveAttribute("href", "/recipes/3/edit");
  });
});
