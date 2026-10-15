import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { afterEach, describe, expect, it } from "vitest";
import { CurrencyField } from "./CurrencyField";

function Form({ minorUnits = true }: { minorUnits?: boolean }) {
  const form = useForm({ defaultValues: { price: minorUnits ? 890000000 : 8900000 } });
  return (
    <FormProvider {...form}>
      <CurrencyField name="price" label="Нэг хүний үнэ" minorUnits={minorUnits} />
      <output data-testid="stored">{form.watch("price")}</output>
    </FormProvider>
  );
}

afterEach(cleanup);

describe("CurrencyField", () => {
  it("displays tugriks while storing integer minor units", () => {
    render(<Form />);
    const input = screen.getByLabelText("Нэг хүний үнэ") as HTMLInputElement;
    expect(input.value.replace(/\D/g, "")).toBe("8900000");
    fireEvent.change(input, { target: { value: "11,800,000" } });
    expect(screen.getByTestId("stored")).toHaveTextContent("1180000000");
    fireEvent.change(input, { target: { value: "" } });
    expect(input.value).toBe("");
  });

  it("preserves the existing whole-tugrik mode", () => {
    render(<Form minorUnits={false} />);
    fireEvent.change(screen.getByLabelText("Нэг хүний үнэ"), { target: { value: "11,800,000" } });
    expect(screen.getByTestId("stored")).toHaveTextContent(/^11800000$/);
  });
});
