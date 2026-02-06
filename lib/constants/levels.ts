export const NIOS_LEVELS = ['A', 'B', 'C'];
export const STANDARD_LEVELS = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString()
);

export const getGradesForBoard = (board: string) => {
  if (board === 'NIOS') {
    return NIOS_LEVELS.map(l => ({ value: l, label: `Level ${l}` }));
  }
  return STANDARD_LEVELS.map(l => ({ value: l, label: `Class ${l}` }));
};
