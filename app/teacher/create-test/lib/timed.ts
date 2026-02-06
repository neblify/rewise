export const DURATION_MINUTE_OPTIONS = [0, 15, 30, 45] as const;
export const MAX_HOURS = 25;

export type TimedState = {
  isTimed: 'timed' | 'not_timed';
  durationHours: number;
  durationMinutes: number;
};

export const defaultTimedState: TimedState = {
  isTimed: 'not_timed',
  durationHours: 0,
  durationMinutes: 0,
};

export function appendTimedToFormData(
  formData: FormData,
  state: TimedState
): void {
  formData.set('isTimed', state.isTimed === 'timed' ? 'true' : 'false');
  if (state.isTimed === 'timed') {
    formData.set('durationHours', String(state.durationHours));
    formData.set('durationMinutes', String(state.durationMinutes));
  }
}

export function parseTimedFromTest(test: {
  isTimed?: boolean;
  durationMinutes?: number;
}): TimedState {
  const isTimed = test.isTimed ? 'timed' : 'not_timed';
  const totalMins = test.durationMinutes ?? 0;
  const durationHours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const durationMinutes = DURATION_MINUTE_OPTIONS.reduce((a, b) =>
    Math.abs(mins - a) < Math.abs(mins - b) ? a : b
  );
  return { isTimed, durationHours, durationMinutes };
}

export type TimedFormPayload = {
  isTimed?: string;
  durationHours?: string;
  durationMinutes?: string;
};

export function parseTimedPayload(payload: TimedFormPayload): {
  isTimed: boolean;
  durationMinutes: number | undefined;
} {
  const isTimed = payload.isTimed === 'true';
  const durationMinutes =
    isTimed && payload.durationHours != null && payload.durationMinutes != null
      ? Number(payload.durationHours) * 60 + Number(payload.durationMinutes)
      : undefined;
  return { isTimed, durationMinutes };
}

export function omitTimedFormFields<T extends TimedFormPayload>(
  data: T
): Omit<T, keyof TimedFormPayload> {
  const {
    isTimed: _it,
    durationHours: _dh,
    durationMinutes: _dm,
    ...rest
  } = data;
  return rest as Omit<T, keyof TimedFormPayload>;
}
