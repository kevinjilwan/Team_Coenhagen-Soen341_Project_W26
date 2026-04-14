import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MealPlansListClient from "@/app/meal-plans/MealPlansListClient";
import WeeklyMealPlanViewClient from "@/app/meal-plans/[id]/WeeklyMealPlanViewClient";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  usePathname: () => "/meal-plans/exam-week",
}));

describe("WeeklyMealPlanViewClient — delete meal plan", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("opens a confirmation modal, calls DELETE on confirm, and navigates back to the meal plans list", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          weeklyMealPlan: {
            id: "exam-week",
            title: "Exam Week",
            week_start_date: "2026-04-13",
            created_at: "2026-04-12T12:00:00.000Z",
          },
          items: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<WeeklyMealPlanViewClient id="exam-week" />);

    await waitFor(() => {
      expect(screen.queryByText("Loading weekly meal plan...")).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(
      screen.getByRole("heading", { name: /delete weekly meal plan\?/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/this weekly meal plan will be permanently deleted/i)
    ).toBeInTheDocument();

    const dialog = screen
      .getByText(/this weekly meal plan will be permanently deleted/i)
      .closest(".max-w-md");
    expect(dialog).toBeTruthy();
    await userEvent.click(
      within(dialog as HTMLElement).getByRole("button", { name: /^delete$/i })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/weekly-meal-plans/exam-week", {
        method: "DELETE",
      });
    });

    expect(mockPush).toHaveBeenCalledWith("/meal-plans");
    expect(mockRefresh).toHaveBeenCalled();
  });
});

describe("MealPlansListClient — list after deletion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("does not show a deleted plan once the API returns an updated list", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        weeklyMealPlans: [
          {
            id: "other-plan",
            title: "Still Here",
            week_start_date: "2026-04-20",
            created_at: "2026-04-12T12:00:00.000Z",
          },
        ],
      }),
    });

    render(<MealPlansListClient />);

    await waitFor(() => {
      expect(screen.queryByText("Loading weekly meal plans...")).not.toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: /still here/i })).toHaveAttribute(
      "href",
      "/meal-plans/other-plan"
    );
    expect(screen.queryByRole("link", { name: /exam week/i })).not.toBeInTheDocument();
  });
});
