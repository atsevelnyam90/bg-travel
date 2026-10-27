import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";
import { emptySection, emptyTravel, type TravelFormValues } from "../travelFormValues";
import { TravelSectionsFields } from "./TravelRelatedFields";

vi.mock("./DepartureFields", () => ({ DepartureFields: () => null }));
vi.mock("./DetailFields", () => ({ DetailFields: () => null }));
vi.mock("./SectionFields", () => ({
  SectionFields: () => <div>Бүлгийн засварын форм</div>,
}));

function SectionsForm() {
  const form = useForm<TravelFormValues>({
    defaultValues: {
      ...emptyTravel(),
      sections: [{ ...emptySection(), title: "Paris & ZZZ", images: ["1.jpg", "2.jpg"] }],
    },
  });

  return (
    <FormProvider {...form}>
      <TravelSectionsFields />
    </FormProvider>
  );
}

afterEach(cleanup);

describe("TravelSectionsFields", () => {
  it("opens the editor by clicking the row instead of a separate edit button", () => {
    render(<SectionsForm />);

    expect(screen.queryByRole("button", { name: "Засах" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Paris & ZZZ/ }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Хөтөлбөрийн бүлэг засах")).toBeInTheDocument();
  });

  it("keeps delete as a separate row action", () => {
    render(<SectionsForm />);

    fireEvent.click(screen.getByRole("button", { name: "Устгах" }));

    expect(screen.queryByText("Paris & ZZZ")).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
