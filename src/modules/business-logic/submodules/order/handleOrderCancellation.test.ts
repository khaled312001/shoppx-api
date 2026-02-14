import { handleOrderCancellation } from "./helper";
import { parseISO } from "date-fns";

describe("handleOrderCancellation", () => {
  it("should allow cancellation within 24 hours and after 2 PM", () => {
    const order = {
      status: "pending",
      purchaseDate: "2024-07-03T10:00:00Z", // 10 AM UTC
    } as any;
    const currentUKTime = parseISO("2024-07-03T14:30:00Z"); // 2:30 PM UTC

    expect(() => handleOrderCancellation(order, currentUKTime)).not.toThrow();
  });

  it("should not allow cancellation before 2 PM for orders placed before 2 PM", () => {
    const order = {
      status: "pending",
      purchaseDate: "2024-07-03T10:00:00Z", // 10 AM UTC
    } as any;
    const currentUKTime = parseISO("2024-07-03T13:30:00Z"); // 1:30 PM UTC

    expect(() => handleOrderCancellation(order, currentUKTime)).toThrow(
      "Cancellation not allowed before 2 PM for orders placed before 2 PM"
    );
  });

  it("should not allow cancellation after 24 hours", () => {
    const order = {
      status: "pending",
      purchaseDate: "2024-07-02T10:00:00Z", // 10 AM UTC yesterday
    } as any;
    const currentUKTime = parseISO("2024-07-03T14:30:00Z"); // 2:30 PM UTC today

    expect(() => handleOrderCancellation(order, currentUKTime)).toThrow(
      "Order cancellation period has expired"
    );
  });

  it("should not allow cancellation for non-pending orders", () => {
    const order = {
      status: "completed",
      purchaseDate: "2024-07-03T10:00:00Z",
    } as any;
    const currentUKTime = parseISO("2024-07-03T14:30:00Z");

    expect(() => handleOrderCancellation(order, currentUKTime)).toThrow(
      "Order cannot be cancelled"
    );
  });
});
