
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";

import App from "./App";
import {
  getEquipment,
  addEquipment,
  getBorrowings,
} from "./services/api";

vi.mock("./services/api", () => ({
  getEquipment: vi.fn(),
  addEquipment: vi.fn(),
  updateEquipment: vi.fn(),
  deleteEquipment: vi.fn(),
  getBorrowings: vi.fn(),
  addBorrowing: vi.fn(),
}));

const mockEquipment = [
  {
    id: "test-equipment-001",
    name: "Hammer",
    category: "Hand Tools",
    quantity: 5,
    availableQuantity: 5,
    description: "Test equipment",
    status: "Available",
  },
];

describe("ToolLoop Frontend Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getEquipment.mockResolvedValue(mockEquipment);
    getBorrowings.mockResolvedValue([]);

    addEquipment.mockImplementation(async (equipment) => ({
      id: "test-equipment-002",
      ...equipment,
    }));
  });

  // F-T1: Dashboard renders correctly
  // INTENTIONAL ERROR FOR CI FAILURE DEMONSTRATION
  it("F-T1: should display the ToolLoop dashboard", async () => {
    render(<App />);

    expect(
      screen.getByText("Welcome to ToolLoop WRONG!")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Total Equipment")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Available Equipment")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(getEquipment).toHaveBeenCalled();
      expect(getBorrowings).toHaveBeenCalled();
    });
  });

  // F-T2: Add equipment successfully
  it("F-T2: should add new equipment", async () => {
    render(<App />);

    await waitFor(() => {
      expect(getEquipment).toHaveBeenCalled();
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Inventory" })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "+ Add Equipment",
      })
    );

    fireEvent.change(
      screen.getByLabelText("Equipment Name"),
      { target: { value: "Welding Machine" } }
    );

    fireEvent.change(
      screen.getByLabelText("Category"),
      { target: { value: "Power Tools" } }
    );

    fireEvent.change(
      screen.getByLabelText("Quantity"),
      { target: { value: "3" } }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Save Equipment",
      })
    );

    await waitFor(() => {
      expect(addEquipment).toHaveBeenCalled();
    });

    expect(
      await screen.findByText(
        "Equipment saved successfully to MongoDB!"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("Welding Machine")
    ).toBeInTheDocument();
  });

  // F-T3: Borrowing form validation
  it("F-T3: should validate required borrowing fields", async () => {
    render(<App />);

    await waitFor(() => {
      expect(getEquipment).toHaveBeenCalled();
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Borrowing",
      })
    );

    const submitButton = screen.getByRole("button", {
      name: "Submit Borrowing Request",
    });

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });

    fireEvent.click(submitButton);

    expect(
      await screen.findByText("Borrower name is required.")
    ).toBeInTheDocument();
  });
});
