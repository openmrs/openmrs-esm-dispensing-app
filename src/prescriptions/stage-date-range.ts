import dayjs from 'dayjs';
import { createGlobalStore, useStore } from '@openmrs/esm-framework';

/**
 * The period the stage tabs (Ordered, Picked, Dispensed, Declined) and their tiles show, like the
 * Laboratory worklist: today by default. Loading only this period keeps the pharmacy page fast; every
 * prescription costs the server about a quarter of a second to load.
 */
export interface StageDateRange {
  start: Date;
  end: Date;
}

interface StageDateRangeStore {
  range: StageDateRange;
}

export function todayRange(now: Date = new Date()): StageDateRange {
  return { start: dayjs(now).startOf('day').toDate(), end: dayjs(now).startOf('day').toDate() };
}

const stageDateRangeStore = createGlobalStore<StageDateRangeStore>('dispensing-stage-date-range', {
  range: todayRange(),
});

export function useStageDateRange() {
  const { range } = useStore(stageDateRangeStore);
  const setRange = (start: Date, end?: Date) =>
    stageDateRangeStore.setState({
      range: { start: dayjs(start).startOf('day').toDate(), end: dayjs(end ?? start).startOf('day').toDate() },
    });
  return { range, setRange };
}

/** FHIR date filters for the range: from the start of the first day to the end of the last day. */
export function stageDateParams(range: StageDateRange): string {
  const from = dayjs(range.start).startOf('day').toISOString();
  const to = dayjs(range.end).startOf('day').add(1, 'day').toISOString();
  return `&date=ge${from}&date=lt${to}`;
}
