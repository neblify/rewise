'use client';

import React from 'react';
import type { TimedState } from '../lib/timed';
import { DURATION_MINUTE_OPTIONS, MAX_HOURS } from '../lib/timed';

const selectClass =
  'block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-gray-900 bg-white';

type Props = {
  value: TimedState;
  onChange: (state: TimedState) => void;
};

export function TestTimeLimitField({ value, onChange }: Props) {
  return (
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Time limit
      </label>
      <div className="flex gap-6">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="isTimed"
            checked={value.isTimed === 'timed'}
            onChange={() => onChange({ ...value, isTimed: 'timed' })}
            className="rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-gray-700">Timed</span>
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="isTimed"
            checked={value.isTimed === 'not_timed'}
            onChange={() => onChange({ ...value, isTimed: 'not_timed' })}
            className="rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-gray-700">Not Timed</span>
        </label>
      </div>
      {value.isTimed === 'timed' && (
        <div className="mt-3 flex gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hours</label>
            <select
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
            <label className="block text-xs text-gray-500 mb-1">Minutes</label>
            <select
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
    </div>
  );
}
