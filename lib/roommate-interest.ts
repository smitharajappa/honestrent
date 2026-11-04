import { getSupabase } from "./supabase";

/**
 * How many real renters want a roommate at this community. The database only returns a
 * community once at least 3 people have picked it, so a small number can never single someone
 * out. Returns 0 on any problem: this line is a nice extra, never required.
 */
export async function fetchRoommateInterest(buildingId: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;
  const { data, error } = await supabase.rpc("roommate_interest_counts");
  if (error || !Array.isArray(data)) return 0;
  const row = (data as { building_id: string; people: number }[]).find(
    (r) => r.building_id === buildingId,
  );
  return row && row.people >= 3 ? row.people : 0;
}
