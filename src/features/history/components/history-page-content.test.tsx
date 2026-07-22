import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HistoryPageContent } from "@/features/history/components/history-page-content";
import type { WeeklyProgressData } from "@/features/history/types";

const { getHistoryDayDetailsActionMock } = vi.hoisted(() => ({
  getHistoryDayDetailsActionMock: vi.fn(),
}));

vi.mock("@/features/history/actions", () => ({
  getHistoryDayDetailsAction: getHistoryDayDetailsActionMock,
}));

describe("HistoryPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getHistoryDayDetailsActionMock.mockImplementation(async (date: string) => ({
      date,
      error: null,
      logs: [
        {
          id: "log-1",
          foodName: "Feta cheese Coop",
          grams: 23,
          gramLabel: "23 g",
          loggedAt: "2026-07-21T07:00:00.000Z",
        },
        {
          id: "log-2",
          foodName: "Walnut",
          grams: 17,
          gramLabel: "17 g",
          loggedAt: "2026-07-21T08:00:00.000Z",
        },
      ],
    }));
  });

  it("opens day details from a logged calendar date", async () => {
    const user = userEvent.setup();
    renderHistory();

    await user.click(
      screen.getByRole("button", {
        name: "July 21, 2026, 2 logged foods. View details.",
      }),
    );

    const dialog = await screen.findByRole("dialog", { name: "July 21, 2026" });
    expect(getHistoryDayDetailsActionMock).toHaveBeenCalledWith("2026-07-21");
    expect(within(dialog).getByText("Feta cheese Coop")).toBeInTheDocument();
    expect(within(dialog).getByText("23 g")).toBeInTheDocument();
    expect(within(dialog).getByText("Walnut")).toBeInTheDocument();
    expect(within(dialog).getByText("17 g")).toBeInTheDocument();
  });

  it("opens the same day-details dialog from a weekly chart day", async () => {
    const user = userEvent.setup();
    renderHistory();

    await user.click(screen.getByRole("button", { name: /^Tue, 2026-07-21\./ }));

    expect(await screen.findByRole("dialog", { name: "July 21, 2026" })).toBeInTheDocument();
    expect(getHistoryDayDetailsActionMock).toHaveBeenCalledWith("2026-07-21");
  });

  it("shows multiple historical snapshot entries without combining them", async () => {
    getHistoryDayDetailsActionMock.mockResolvedValueOnce({
      date: "2026-07-21",
      error: null,
      logs: [
        {
          id: "log-1",
          foodName: "Cottage cheese TINE",
          grams: 60,
          gramLabel: "60 g",
          loggedAt: "2026-07-21T07:00:00.000Z",
        },
        {
          id: "log-2",
          foodName: "Cottage cheese TINE",
          grams: 20,
          gramLabel: "20 g",
          loggedAt: "2026-07-21T08:00:00.000Z",
        },
      ],
    });
    const user = userEvent.setup();
    renderHistory();

    await user.click(
      screen.getByRole("button", {
        name: "July 21, 2026, 2 logged foods. View details.",
      }),
    );

    const dialog = await screen.findByRole("dialog", { name: "July 21, 2026" });
    expect(within(dialog).getAllByText("Cottage cheese TINE")).toHaveLength(2);
    expect(within(dialog).getByText("60 g")).toBeInTheDocument();
    expect(within(dialog).getByText("20 g")).toBeInTheDocument();
  });

  it("shows an empty state for a date with no food logs", async () => {
    getHistoryDayDetailsActionMock.mockResolvedValueOnce({
      date: "2026-07-22",
      error: null,
      logs: [],
    });
    const user = userEvent.setup();
    renderHistory();

    await user.click(screen.getByRole("button", { name: /^Wed, 2026-07-22\./ }));

    expect(
      await screen.findByText("No foods were logged on this day."),
    ).toBeInTheDocument();
  });

  it("shows a retryable error if loading fails", async () => {
    getHistoryDayDetailsActionMock
      .mockResolvedValueOnce({
        date: "2026-07-21",
        error: "Food logs could not be loaded for this day.",
        logs: [],
      })
      .mockResolvedValueOnce({
        date: "2026-07-21",
        error: null,
        logs: [],
      });
    const user = userEvent.setup();
    renderHistory();

    await user.click(
      screen.getByRole("button", {
        name: "July 21, 2026, 2 logged foods. View details.",
      }),
    );
    expect(
      await screen.findByText("Food logs could not be loaded for this day."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(getHistoryDayDetailsActionMock).toHaveBeenCalledTimes(2));
  });

  it("closes with the close button and Escape", async () => {
    const user = userEvent.setup();
    renderHistory();

    await user.click(
      screen.getByRole("button", {
        name: "July 21, 2026, 2 logged foods. View details.",
      }),
    );
    await user.click(await screen.findByRole("button", { name: "Close day details" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Tue, 2026-07-21\./ }));
    expect(await screen.findByRole("dialog", { name: "July 21, 2026" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps weekly navigation and metric tabs working", async () => {
    const user = userEvent.setup();
    renderHistory();

    expect(screen.getByRole("link", { name: "Previous week" })).toHaveAttribute(
      "href",
      "/history?week=2026-07-13",
    );
    expect(screen.getByRole("link", { name: "Next week" })).toHaveAttribute(
      "href",
      "/history?week=2026-07-27",
    );
    expect(screen.getByRole("tabpanel", { name: "Calories weekly progress chart" }))
      .toBeInTheDocument;

    await user.click(screen.getByRole("tab", { name: "Protein" }));

    expect(screen.getByRole("tabpanel", { name: "Protein weekly progress chart" }))
      .toBeInTheDocument;
    expect(screen.getByRole("button", { name: /^Tue, 2026-07-21\./ })).toHaveAccessibleName(
      expect.stringContaining("consumed 9 g"),
    );
  });

  it("shows responsive calendar hints and logged-day dots with accessible counts", () => {
    renderHistory();

    expect(screen.getByText("Tap a logged day to view foods")).toHaveClass("sm:hidden");
    expect(screen.getByText("Click a logged day to view foods")).toHaveClass(
      "hidden",
      "sm:inline",
    );

    const loggedDay = screen.getByRole("button", {
      name: "July 21, 2026, 2 logged foods. View details.",
    });

    expect(loggedDay).toHaveAttribute("title", "2 logged foods - View details");
    expect(loggedDay).toHaveTextContent("21");
    expect(within(loggedDay).queryByText("2")).not.toBeInTheDocument();
    expect(loggedDay.querySelector(".absolute.bottom-1.left-1\\/2")).toBeInTheDocument();
    expect(screen.getByLabelText("July 22, 2026").querySelector(".absolute")).toBeNull();
  });

  it("makes logged dates keyboard-focusable and opens details with Enter or Space", async () => {
    const user = userEvent.setup();
    renderHistory();

    const loggedDay = screen.getByRole("button", {
      name: "July 21, 2026, 2 logged foods. View details.",
    });

    await user.tab();
    expect(loggedDay).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(await screen.findByRole("dialog", { name: "July 21, 2026" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close day details" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    loggedDay.focus();
    await user.keyboard(" ");
    expect(await screen.findByRole("dialog", { name: "July 21, 2026" })).toBeInTheDocument();
  });

  it("keeps Logged and Today calendar states distinguishable", () => {
    renderHistory();

    expect(screen.getByText("Logged").querySelector(".bg-primary")).toBeInTheDocument();
    expect(screen.getByText("Today").querySelector(".border-primary")).toBeInTheDocument();
  });
});

function renderHistory() {
  return render(
    <HistoryPageContent
      activeDateCounts={{ "2026-07-21": 2 }}
      activeDates={["2026-07-21"]}
      selectedDate="2026-07-21"
      streak={{
        activeDays: 1,
        currentStreak: 1,
        longestStreak: 1,
        weekDays: [
          { date: "2026-07-20", isComplete: false, isToday: false, label: "M" },
          { date: "2026-07-21", isComplete: true, isToday: true, label: "T" },
          { date: "2026-07-22", isComplete: false, isToday: false, label: "W" },
          { date: "2026-07-23", isComplete: false, isToday: false, label: "T" },
          { date: "2026-07-24", isComplete: false, isToday: false, label: "F" },
          { date: "2026-07-25", isComplete: false, isToday: false, label: "S" },
          { date: "2026-07-26", isComplete: false, isToday: false, label: "S" },
        ],
      }}
      weeklyProgress={weeklyProgressData()}
    />,
  );
}

function weeklyProgressData(): WeeklyProgressData {
  const zeroValues = {
    calories: {
      consumed: 0,
      target: 2000,
      completionRatio: 0,
      targetStatus: "below" as const,
    },
    protein: {
      consumed: 0,
      target: 50,
      completionRatio: 0,
      targetStatus: "below" as const,
    },
    carbohydrates: {
      consumed: 0,
      target: 275,
      completionRatio: 0,
      targetStatus: "below" as const,
    },
    fat: {
      consumed: 0,
      target: 78,
      completionRatio: 0,
      targetStatus: "below" as const,
    },
  };

  return {
    weekStart: "2026-07-20",
    weekEnd: "2026-07-26",
    previousWeekStart: "2026-07-13",
    nextWeekStart: "2026-07-27",
    weekStartsOn: "monday",
    days: [
      {
        date: "2026-07-20",
        isToday: false,
        label: "Mon",
        shortLabel: "M",
        values: zeroValues,
      },
      {
        date: "2026-07-21",
        isToday: true,
        label: "Tue",
        shortLabel: "T",
        values: {
          calories: {
            consumed: 200,
            target: 2000,
            completionRatio: 0.1,
            targetStatus: "below",
          },
          protein: {
            consumed: 9,
            target: 50,
            completionRatio: 0.18,
            targetStatus: "below",
          },
          carbohydrates: {
            consumed: 12,
            target: 275,
            completionRatio: 0.04,
            targetStatus: "below",
          },
          fat: {
            consumed: 7,
            target: 78,
            completionRatio: 0.09,
            targetStatus: "below",
          },
        },
      },
      {
        date: "2026-07-22",
        isToday: false,
        label: "Wed",
        shortLabel: "W",
        values: zeroValues,
      },
      {
        date: "2026-07-23",
        isToday: false,
        label: "Thu",
        shortLabel: "T",
        values: zeroValues,
      },
      {
        date: "2026-07-24",
        isToday: false,
        label: "Fri",
        shortLabel: "F",
        values: zeroValues,
      },
      {
        date: "2026-07-25",
        isToday: false,
        label: "Sat",
        shortLabel: "S",
        values: zeroValues,
      },
      {
        date: "2026-07-26",
        isToday: false,
        label: "Sun",
        shortLabel: "S",
        values: zeroValues,
      },
    ],
  };
}
