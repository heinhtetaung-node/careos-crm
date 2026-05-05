import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import _range from "lodash/range";
import React from "react";

import "@testing-library/jest-dom";
import AppointmentModal from "../index";
import { setTimeout } from "timers";

describe("AppointmentModal", () => {
  it("should show appointment modal correctly", () => {
    render(
      <AppointmentModal
        timeSlots={null}
        Inputs={[]}
        days={[]}
        onAddClick={jest.fn()}
        onCancelClick={jest.fn()}
      />,
    );
    expect(screen.getByTestId("appointment-modal")).toBeInTheDocument();
  });

  it("should show card loading", () => {
    render(
      <AppointmentModal
        timeSlots={null}
        Inputs={[]}
        days={[]}
        onAddClick={jest.fn()}
        onCancelClick={jest.fn()}
        loading
      />,
    );
    expect(screen.getAllByTestId("card-loading").length).toBe(5);
  });

  it("active card should be visible in the scroll bar", () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    render(
      <AppointmentModal
        timeSlots={null}
        Inputs={[]}
        days={_range(1, 9).map((num) => ({
          id: num.toString(),
          active: num === 8,
        }))}
        onAddClick={jest.fn()}
        onCancelClick={jest.fn()}
      />,
    );
    expect(screen.getByTestId("daycard-8")).toBeVisible();
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("should not show title bar if includeTitleBar is false", () => {
    render(
      <AppointmentModal
        timeSlots={null}
        Inputs={[]}
        days={[]}
        onAddClick={jest.fn()}
        onCancelClick={jest.fn()}
        includeTitleBar={false}
      />,
    );
    expect(screen.queryByText("appointment")).not.toBeInTheDocument();
  });

  it("should show loading while calling handle submit", async () => {
    render(
      <AppointmentModal
        timeSlots={null}
        Inputs={[]}
        days={[]}
        submitting
        onAddClick={jest.fn()}
        onCancelClick={jest.fn()}
      />,
    );
    expect(screen.getByTestId("loading-btn")).toBeInTheDocument();
  });
});
