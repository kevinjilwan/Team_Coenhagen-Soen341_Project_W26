import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditWeeklyMealPlanClient from "@/app/meal-plans/[id]/edit/EditWeeklyMealPlanClient";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/meal-plans/exam-week/edit",
}));

const planPayload = {
  weeklyMealPlan: {
    id: "exam-week",
    title: "Exam Week Plan",
    week_start_date: "2026-04-13",
    created_at: "2026-04-12T12:00:00.000Z",
  },
};

function setupFetchMock(options: {
  recipes: { id: string; title: string | null }[];
  initialItems: unknown[];
  itemsAfterAssign?: unknown[];
}) {
  let items = [...options.initialItems];

  (global.fetch as jest.Mock).mockImplementation(
    (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      const method = init?.method ?? "GET";

      if (url === "/api/weekly-meal-plans/exam-week" && method === "GET") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ...planPayload,
            items,
          }),
        });
      }

      if (url === "/api/recipes" && method === "GET") {
        return Promise.resolve({
          ok: true,
          json: async () => ({ recipes: options.recipes }),
        });
      }

      if (url === "/api/weekly-meal-plans/exam-week/items" && method === "POST") {
        if (options.itemsAfterAssign) {
          items = options.itemsAfterAssign as typeof items;
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        });
      }

      return Promise.reject(new Error(`Unhandled fetch: ${method} ${url}`));
    }
  );
}

describe("EditWeeklyMealPlanClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("assigns a recipe to a day and meal via POST, then shows it in the weekly grid", async () => {
    const assignedItem = {
      id: "breakfast-monday",
      day_of_week: "monday",
      meal_type: "breakfast",
      recipe_id: "oatmeal-bowl",
      created_at: "2026-04-12T12:00:00.000Z",
      recipes: { id: "oatmeal-bowl", title: "Oatmeal Bowl", description: "With berries" },
    };

    setupFetchMock({
      recipes: [{ id: "oatmeal-bowl", title: "Oatmeal Bowl" }],
      initialItems: [],
      itemsAfterAssign: [assignedItem],
    });

    render(<EditWeeklyMealPlanClient id="exam-week" />);

    await waitFor(() => {
      expect(screen.queryByText("Loading weekly meal plan...")).not.toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: /edit weekly meal plan/i })).toBeInTheDocument();

    const mondayCard = screen.getByRole("heading", { name: "Monday" }).parentElement as HTMLElement;
    const breakfastSelect = within(mondayCard).getAllByRole("combobox")[0];

    await userEvent.selectOptions(breakfastSelect, "oatmeal-bowl");

    await waitFor(() => {
      expect(within(mondayCard).getByText(/assigned: oatmeal bowl/i)).toBeInTheDocument();
    });

    const postCalls = (global.fetch as jest.Mock).mock.calls.filter(
      ([u, init]) =>
        u === "/api/weekly-meal-plans/exam-week/items" && (init as RequestInit)?.method === "POST"
    );
    expect(postCalls.length).toBeGreaterThanOrEqual(1);
    const [, postInit] = postCalls[0];
    expect(JSON.parse((postInit as RequestInit).body as string)).toEqual({
      day_of_week: "monday",
      meal_type: "breakfast",
      recipe_id: "oatmeal-bowl",
    });
  });

  it("shows only the default option in the recipe dropdown when the user has no saved recipes", async () => {
    setupFetchMock({
      recipes: [],
      initialItems: [],
    });

    render(<EditWeeklyMealPlanClient id="exam-week" />);

    await waitFor(() => {
      expect(screen.queryByText("Loading weekly meal plan...")).not.toBeInTheDocument();
    });

    const mondayCard = screen.getByRole("heading", { name: "Monday" }).parentElement as HTMLElement;
    const breakfastSelect = within(mondayCard).getAllByRole("combobox")[0];

    const options = Array.from(breakfastSelect.querySelectorAll("option"));
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("No recipe assigned");
  });
});
