import { render } from "@testing-library/react";
import React, { useContext } from "react";

import "@testing-library/jest-dom";
import UIContext, { Context } from "..";

function MockComp() {
  const { t } = useContext(Context);
  return <div>{t("hello")}</div>;
}

describe("UIContext", () => {
  it("should set the resources and correctly set namespace for translation", () => {
    const mockI18nInstance = {
      addResourceBundle: jest.fn(),
      t: jest.fn(),
    };
    render(
      <UIContext i18nInstance={mockI18nInstance as any}>
        <MockComp />
      </UIContext>,
    );
    expect(mockI18nInstance.addResourceBundle).toHaveBeenCalledTimes(2);
    expect(mockI18nInstance.t).toHaveBeenCalledWith("alphafoundersUi:hello");
  });
  it("dummy case: if i18n is not applied, logics will be decided later", () => {
    render(<UIContext>hello</UIContext>);
  });
});
