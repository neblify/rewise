'use client';

import React from 'react';
import type { TimedState } from '../lib/timed';
import { DURATION_MINUTE_OPTIONS, MAX_HOURS } from '../lib/timed';

const selectClass =
  'block w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary text-foreground bg-card';

type Props = {
  value: TimedState;
  onChange: (state: TimedState) => void;
};

export function TestTimeLimitField({ value, onChange }: Props) {
  return (
    <fieldset className="col-span-2">
      <legend className="block text-sm font-medium text-muted-foreground mb-2">
        Time limit
      </legend>
      <div className="flex gap-6">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="isTimed"
            checked={value.isTimed === 'timed'}
            onChange={() => {
              onChange({ ...value, isTimed: 'timed' });
            }}
            className="rounded-full border-border text-primary focus:ring-primary"
          />
          <span className="text-muted-foreground">Timed</span>
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="isTimed"
            checked={value.isTimed === 'not_timed'}
            onChange={() => {
              onChange({ ...value, isTimed: 'not_timed' });
            }}
            className="rounded-full border-border text-primary focus:ring-primary"
          />
          <span className="text-muted-foreground">Not Timed</span>
        </label>
      </div>
      {value.isTimed === 'timed' && (
        <div className="mt-3 flex gap-4">
          <div>
            <label
              htmlFor="time-limit-hours"
              className="block text-xs text-muted-foreground mb-1"
            >
              Hours
            </label>
            <select
              id="time-limit-hours"
              value={value.durationHours}
              onChange={e =>
                onChange({
                  ...value,
                  durationHours: Number(e.target.value),
                })
              }
              className={selectClass}
            >
              {Array.from({ length: MAX_HOURS }, (_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="time-limit-minutes"
              className="block text-xs text-muted-foreground mb-1"
            >
              Minutes
            </label>
            <select
              id="time-limit-minutes"
              value={value.durationMinutes}
              onChange={e =>
                onChange({
                  ...value,
                  durationMinutes: Number(e.target.value),
                })
              }
              className={selectClass}
            >
              {DURATION_MINUTE_OPTIONS.map(m => (
                <option key={m} value={m}>
                  {String(m).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </fieldset>
  );
}
