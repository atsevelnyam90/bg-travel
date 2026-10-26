import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { replaceMock, useSessionMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  useSessionMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));
vi.mock("../hooks/useSession", () => ({ useSession: useSessionMock }));

import { RequireGuest } from "./RequireGuest";

describe("RequireGuest", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    useSessionMock.mockReset();
  });

  it("session байвал login content-ийг нууж admin руу шилжүүлнэ", async () => {
    useSessionMock.mockReturnValue({
      isAuthenticated: true,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(
      <RequireGuest>
        <p>Нэвтрэх form</p>
      </RequireGuest>,
    );

    expect(screen.queryByText("Нэвтрэх form")).not.toBeInTheDocument();
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/admin/dashboard"));
  });

  it("session байхгүй бол login content-ийг харуулна", () => {
    useSessionMock.mockReturnValue({
      isAuthenticated: false,
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });

    render(
      <RequireGuest>
        <p>Нэвтрэх form</p>
      </RequireGuest>,
    );

    expect(screen.getByText("Нэвтрэх form")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
