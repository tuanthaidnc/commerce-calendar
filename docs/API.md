# API reference

All dates returned by the library are civil date strings (`YYYY-MM-DD`), not
instants or localized display labels. Supply verified processing/shipping ranges.

## createCalendar(options)

| Option | Format | Default |
| --- | --- | --- |
| timeZone | IANA zone accepted by Intl | Required |
| workingWeekdays | Nonempty array, Sunday=0 … Saturday=6 | Monday–Friday |
| recurringHolidays | Array of `MM-DD` | Empty |
| closedDates | Array of `YYYY-MM-DD` | Empty |

Arrays are copied at creation. Modifying them afterward does not change the
calendar. No national holidays or observed substitute days are added implicitly.

### calendar.dateAt(instant)

Accepts a valid Date or ISO timestamp with explicit `Z`/numeric offset. Converts
it to a civil date in the configured time zone. Rejects offset-free timestamps,
impossible civil dates and overflowing clock fields such as `24:00:00`.

### calendar.isBusinessDay(date)

Returns a boolean using configured weekdays and exclusions. Invalid dates throw.

### calendar.addBusinessDays(start, days)

Counts eligible dates strictly after start. Zero returns start unchanged,
including on a closed day. Requires an integer from 0 to 36,600. The search is
bounded to 36,600 civil days, so large requests on sparse calendars can throw
before completion. Date arithmetic does not assume all local days are24hours.

## estimateDelivery({calendar, orderedAt, processing, shipping})

Each stage has `{min, max}` nonnegative integer business-day counts, min <= max.
Missing processing or shipping returns `null`. Invalid supplied ranges throw.
Processing starts after the order's local civil date; shipping starts after
each endpoint of processing. Both stages use the same calendar.

```js
{
  orderDate: '2026-09-22',
  processingEnd: {earliest: '2026-09-29', latest: '2026-10-01'},
  arrival: {earliest: '2026-10-08', latest: '2026-10-19'}
}
```

That result uses the README example's Pacific calendar and5–7processing plus
7–12shipping business days. It is not a generic default or carrier guarantee.

## Errors and limits

TypeError/RangeError indicate invalid input/configuration; callers should handle
them at their application boundary. Years0001–9999only. Cutoff times, carrier
events, separate shipping calendars and automatic holiday feeds are not included.
