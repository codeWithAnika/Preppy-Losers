import type { Tables } from "@/lib/database.types";

/** Row shape for public.profiles — email lives in auth.users, not here */
export type ProfileRow = Tables<"profiles">;

export type Profile = ProfileRow;
