import { render, screen, waitFor, within } from "@testing-library/react";
import MealPlansListClient from "@/app/meal-plans/MealPlansListClient";
import WeeklyMealPlanViewClient from "@/app/meal-plans/[id]/WeeklyMealPlanViewClient";

jest.mock("@/components/site-navbar", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/meal-plans",
}));

describe("MealPlansListClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("loads weekly meal plans from the API and links each plan to its detail page", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        weeklyMealPlans: [
          {
            id: "exam-week",
            title: "Exam Week",
            week_start_date: "2026-04-13",
            created_at: "2026-04-12T12:00:00.000Z",
          },
          {
            id: "null-week",
            title: null,
            week_start_date: "2026-04-20",
            created_at: "2026-04-12T12:00:00.000Z",
          },
        ],
      }),
    });

    render(<MealPlansListClient />);

    expect(screen.getByText("Loading weekly meal plans...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Loading weekly meal plans...")).not.toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: /my weekly meal plans/i })).toBeInTheDocument();

    const examLink = screen.getByRole("link", { name: /exam week/i });
    expect(examLink).toHaveAttribute("href", "/meal-plans/exam-week");

    const untitledLink = screen.getByRole("link", { name: /untitled weekly meal plan/i });
    expect(untitledLink).toHaveAttribute("href", "/meal-plans/null-week");
  });
});

describe("WeeklyMealPlanViewClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("renders the weekly grid with assigned recipes for each day and meal slot", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        weeklyMealPlan: {
          id: "exam-week",
          title: "Exam Week",
          week_start_date: "2026-04-13",
          created_at: "2026-04-12T12:00:00.000Z",
        },
        items: [
          {
            id: "item-1",
            day_of_week: "monday",
            meal_type: "breakfast",
            recipe_id: "rec-1",
            created_at: "2026-04-12T12:00:00.000Z",
            recipes: { id: "rec-1", title: "Oatmeal Bowl", description: "With berries" },
          },
          {
            id: "item-2",
            day_of_week: "tuesday",
            meal_type: "dinner",
            recipe_id: "rec-2",
            created_at: "2026-04-12T12:00:00.000Z",
            recipes: { id: "rec-2", title: "Pasta Night", description: null },
          },
        ],
      }),
    });

    render(<WeeklyMealPlanViewClient id="exam-week" />);

    await waitFor(() => {
      expect(screen.queryByText("Loading weekly meal plan...")).not.toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: "Exam Week" })).toBeInTheDocument();

    const mondayCard = screen.getByRole("heading", { name: "Monday" }).parentElement as HTMLElement;
    expect(within(mondayCard).getByText("Breakfast")).toBeInTheDocument();
    expect(within(mondayCard).getByText("Oatmeal Bowl")).toBeInTheDocument();
    expect(within(mondayCard).getByText("With berries")).toBeInTheDocument();

    const tuesdayCard = screen.getByRole("heading", { name: "Tuesday" }).parentElement as HTMLElement;
    expect(within(tuesdayCard).getByText("Dinner")).toBeInTheDocument();
    expect(within(tuesdayCard).getByText("Pasta Night")).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith("/api/weekly-meal-plans/exam-week", {
      method: "GET",
    });
  });
});
