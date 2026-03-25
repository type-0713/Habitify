export interface SupabaseHabitRow {
  id: number;
  Name: string;
  Goal: number;
  Unit: string;
  Icon: string | null;
  ReminderTime: string | null;
  User: string;
  Habitt: boolean | null;
}

interface CreateHabitPayload {
  name: string;
  goal: number;
  unit: string;
  icon: string;
  reminderTime?: string;
  user: string;
  habitt?: boolean;
}

const request = async <T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, init);

  if (!response.ok) {
    let message = `Request failed with ${response.status}.`;

    try {
      const payload = (await response.json()) as { error?: string };
      message = payload.error ?? message;
    } catch {
      // Ignore JSON parse errors and keep the fallback message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const listHabitsByUser = async (user: string): Promise<SupabaseHabitRow[]> => {
  const params = new URLSearchParams({ user });

  return request<SupabaseHabitRow[]>(`/api/habits?${params.toString()}`, {
    method: 'GET',
    cache: 'no-store',
  });
};

export const createHabit = async (payload: CreateHabitPayload): Promise<SupabaseHabitRow> => {
  return request<SupabaseHabitRow>('/api/habits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
};

export const deleteHabitById = async (id: number, user: string): Promise<void> => {
  const params = new URLSearchParams({
    id: String(id),
    user,
  });

  await request<void>(`/api/habits?${params.toString()}`, {
    method: 'DELETE',
  });
};

export const deleteHabitsByUser = async (user: string): Promise<void> => {
  const params = new URLSearchParams({ user });

  await request<void>(`/api/habits?${params.toString()}`, {
    method: 'DELETE',
  });
};
