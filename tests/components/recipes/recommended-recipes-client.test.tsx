import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecommendedRecipesClient from "@/app/recipes/recommended/RecommendedRecipesClient";

jest.mock("@/components/site-navbar", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/recipes/recommended",
}));

describe("RecommendedRecipesClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("shows validation errors when ingredients or time are missing and does not call the API", async () => {
    render(<RecommendedRecipesClient />);

    expect(screen.getByRole("heading", { name: /get recommended recipes/i })).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/available time/i), "25");
    await userEvent.click(screen.getByRole("button", { name: /get recommendations/i }));

    expect(await screen.findByText("Enter at least one ingredient.")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();

    await userEvent.type(
      screen.getByLabelText(/available ingredients/i),
      "rice, beans"
    );
    await userEvent.clear(screen.getByLabelText(/available time/i));
    await userEvent.click(screen.getByRole("button", { name: /get recommendations/i }));

    expect(await screen.findByText("Enter a valid available time in minutes.")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts ingredients and max time, then lists recommended recipes with details on each card", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        primary: [
          {
            title: "Quick Rice Bowl",
            description: "Warm and filling.",
            ingredients: ["1 cup rice", "beans"],
            preparation_steps: ["Cook rice.", "Top with beans."],
            preparation_time: 20,
            cost: 4.5,
            difficulty: "easy" as const,
            dietary_tags: ["vegetarian"],
          },
        ],
        related: [],
      }),
    });

    render(<RecommendedRecipesClient />);

    await userEvent.type(
      screen.getByLabelText(/available ingredients/i),
      "rice, beans, lime"
    );
    await userEvent.type(screen.getByLabelText(/available time/i), "30");
    await userEvent.click(screen.getByRole("button", { name: /get recommendations/i }));

    await waitFor(() => {
      expect(screen.getByText("Quick Rice Bowl")).toBeInTheDocument();
    });

    expect(screen.getByText(/warm and filling/i)).toBeInTheDocument();
    expect(screen.getByText(/1 cup rice, beans/i)).toBeInTheDocument();
    expect(screen.getByText(/1\. cook rice/i)).toBeInTheDocument();
    expect(screen.getByText(/1 recipe returned/i)).toBeInTheDocument();

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("/api/recommended");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({
      ingredients: ["rice", "beans", "lime"],
      maxTime: 30,
    });
  });

  it("saves a recommendation via POST /api/recipes and shows Saved as confirmation", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          primary: [
            {
              title: "Soup",
              description: "Good soup.",
              ingredients: ["broth", "noodles"],
              preparation_steps: ["Simmer broth.", "Add noodles."],
              preparation_time: 15,
              cost: 3,
              difficulty: "easy" as const,
              dietary_tags: [],
            },
          ],
          related: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ recipe: { id: "soup" } }),
      });

    render(<RecommendedRecipesClient />);

    await userEvent.type(screen.getByLabelText(/available ingredients/i), "broth, noodles");
    await userEvent.type(screen.getByLabelText(/available time/i), "20");
    await userEvent.click(screen.getByRole("button", { name: /get recommendations/i }));

    await screen.findByText("Soup");

    await userEvent.click(screen.getByRole("button", { name: /add to my recipes/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^saved$/i })).toBeInTheDocument();
    });

    const saveCalls = (global.fetch as jest.Mock).mock.calls.filter(
      ([u, init]) => u === "/api/recipes" && (init as RequestInit)?.method === "POST"
    );
    expect(saveCalls.length).toBe(1);
    const [, saveInit] = saveCalls[0];
    const body = JSON.parse((saveInit as RequestInit).body as string);
    expect(body.title).toBe("Soup");
    expect(body.ingredients).toEqual(["broth", "noodles"]);
  });
});
