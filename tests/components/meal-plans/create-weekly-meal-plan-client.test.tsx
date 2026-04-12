import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateWeeklyMealPlanClient from "@/app/meal-plans/new/CreateWeeklyMealPlanClient";

const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  usePathname: () => "/meal-plans/new",
}));

describe("CreateWeeklyMealPlanClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("shows a validation message and does not call the API when the week start date is missing", async () => {
    render(<CreateWeeklyMealPlanClient />);

    await userEvent.type(screen.getByPlaceholderText("Exam Week Plan"), "Spring Break");
    await userEvent.click(screen.getByRole("button", { name: /create weekly meal plan/i }));

    expect(await screen.findByText("Week start date is required.")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("submits the plan and navigates to My Weekly Meal Plans on success", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ weeklyMealPlan: { id: "1" } }),
    });

    const { container } = render(<CreateWeeklyMealPlanClient />);

    await userEvent.type(screen.getByPlaceholderText("Exam Week Plan"), "Spring Break");
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2026-04-13" } });

    await userEvent.click(screen.getByRole("button", { name: /create weekly meal plan/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/weekly-meal-plans",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
      const [, options] = (global.fetch as jest.Mock).mock.calls[0];
      expect(JSON.parse(options.body)).toEqual({
        title: "Spring Break",
        week_start_date: "2026-04-13",
      });
      expect(mockPush).toHaveBeenCalledWith("/meal-plans");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
