import type { auth } from "@/api/generated/contracts";
import { api } from "@/lib/api/apiClient";

export const login = (input: auth.LoginInput) => api.post<auth.TokenPair>("/auth/login", input);

export const logout = () => api.post<void>("/auth/logout");

// skipAuthRefresh: 401 үед сэргээх оролдлого хийхгүй — нэвтрээгүй нь хэвийн хариу.
export const fetchMe = () => api.get<auth.Me>("/auth/me", { skipAuthRefresh: true });
