import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WeeklyMealPlanViewClient from "@/app/meal-plans/[id]/WeeklyMealPlanViewClient";
import EditWeeklyMealPlanClient from "@/app/meal-plans/[id]/edit/EditWeeklyMealPlanClient";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  usePathname: () => "/meal-plans/exam-week",
}));

describe("Meal plan view → edit navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('links "Edit Plan" to the edit route for the open meal plan', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
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
    });

    render(<WeeklyMealPlanViewClient id="exam-week" />);

    await waitFor(() => {
      expect(screen.queryByText("Loading weekly meal plan...")).not.toBeInTheDocument();
    });

    const editLink = screen.getByRole("link", { name: /edit plan/i });
    expect(editLink).toHaveAttribute("href", "/meal-plans/exam-week/edit");
  });
});

describe("Edit page: pre-filled data, validation, and saving plan details", () => {
  const apiError =
    "week_start_date is required and must be in YYYY-MM-DD format.";

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("shows loaded plan fields, surfaces PATCH errors for invalid data, then succeeds on valid Save", async () => {
    let currentPlan = {
      id: "exam-week",
      title: "Original Title",
      week_start_date: "2026-04-13",
      created_at: "2026-04-12T12:00:00.000Z",
    };

    (global.fetch as jest.Mock).mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : (input as Request).url;
        const method = init?.method ?? "GET";

        if (url === "/api/weekly-meal-plans/exam-week" && method === "GET") {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              weeklyMealPlan: currentPlan,
              items: [],
            }),
          });
        }

        if (url === "/api/recipes" && method === "GET") {
          return Promise.resolve({
            ok: true,
            json: async () => ({ recipes: [] }),
          });
        }

        if (url === "/api/weekly-meal-plans/exam-week" && method === "PATCH") {
          const body = JSON.parse((init?.body as string) || "{}");
          if (!/^\d{4}-\d{2}-\d{2}$/.test(body.week_start_date || "")) {
            return Promise.resolve({
              ok: false,
              status: 400,
              json: async () => ({ error: apiError }),
            });
          }
          currentPlan = {
            ...currentPlan,
            title: body.title ?? null,
            week_start_date: body.week_start_date,
          };
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ weeklyMealPlan: currentPlan }),
          });
        }

        return Promise.reject(new Error(`Unhandled fetch: ${method} ${url}`));
      }
    );

    render(<EditWeeklyMealPlanClient id="exam-week" />);

    await waitFor(() => {
      expect(screen.queryByText("Loading weekly meal plan...")).not.toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText("Exam Week Plan");
    expect(titleInput).toHaveValue("Original Title");

    const dateInput = document.querySelector(
      'input[type="date"]'
    ) as HTMLInputElement;
    expect(dateInput).toHaveValue("2026-04-13");

    fireEvent.change(dateInput, { target: { value: "" } });
    await userEvent.click(screen.getByRole("button", { name: /save plan details/i }));

    expect(await screen.findByText(apiError)).toBeInTheDocument();

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Updated Title");
    fireEvent.change(dateInput, { target: { value: "2026-05-01" } });

    await userEvent.click(screen.getByRole("button", { name: /save plan details/i }));

    await waitFor(() => {
      expect(screen.queryByText(apiError)).not.toBeInTheDocument();
    });

    const patchCalls = (global.fetch as jest.Mock).mock.calls.filter(
      ([u, init]) =>
        u === "/api/weekly-meal-plans/exam-week" &&
        (init as RequestInit)?.method === "PATCH"
    );
    expect(patchCalls.length).toBeGreaterThanOrEqual(2);

    const [, lastPatchInit] = patchCalls[patchCalls.length - 1];
    expect(JSON.parse((lastPatchInit as RequestInit).body as string)).toEqual({
      title: "Updated Title",
      week_start_date: "2026-05-01",
    });

    await waitFor(() => {
      expect(titleInput).toHaveValue("Updated Title");
    });
    expect(dateInput).toHaveValue("2026-05-01");
  });
});
