# commerce-calendar

[![Tests](https://github.com/tuanthaidnc/commerce-calendar/actions/workflows/test.yml/badge.svg)](https://github.com/tuanthaidnc/commerce-calendar/actions/workflows/test.yml)

Business-day calendars and staged delivery estimates for small commerce tools.
ES modules, TypeScript declarations, no runtime dependencies. Requires Node 20+
or a modern JavaScript runtime with Intl time-zone support.

**Status:** early 0.1.0 source release. Not published on npm.
The npm package name has not been checked for availability. No external adoption
or production integration is claimed.

Repository: https://github.com/tuanthaidnc/commerce-calendar

## Try it

Clone the repository, then run from its directory (no install needed):

```sh
npm test
npm run example
```

```js
import {createCalendar, estimateDelivery} from './index.js';
const calendar = createCalendar({
  timeZone: 'America/Los_Angeles',
  recurringHolidays: ['01-01', '05-01']
});
const result = estimateDelivery({
  calendar,
  orderedAt: '2026-09-22T12:00:00-07:00',
  processing: {min: 5, max: 7},
  shipping: {min: 7, max: 12}
});
// result.arrival: {earliest: '2026-10-08', latest: '2026-10-19'}
```

## Contract

- `createCalendar(options)` requires an explicit IANA time zone. Default working
  days are Monday–Friday. Weekdays use Sunday=0 through Saturday=6.
- `dateAt(instant)` converts a Date or ISO timestamp with explicit offset to a
  civil `YYYY-MM-DD` date in the configured zone. No implicit machine time zone.
- `isBusinessDay(date)` checks weekdays, recurring `MM-DD` holidays and explicit
  `YYYY-MM-DD` closures. No national calendar or observed holiday is inferred.
- `addBusinessDays(start, n)` excludes start; zero returns start unchanged even
  on a closed day. Uses civil days, so DST does not add/remove a business day.
- `estimateDelivery` completes processing before counting shipping. Each range
  requires nonnegative integer `min <= max`. Zero-day stages are allowed.
  Missing processing/shipping returns null; malformed supplied values throw.
- Search is bounded to 36,600 civil days; longer/unreachable searches throw.
  Civil dates use years 0001–9999. Results are estimates, not dispatch
  evidence or a carrier promise.

Not included: order cutoffs, capacity scheduling, carrier APIs, regional holiday
feeds, size/SKU resolution, billing, customer information or storefront code.
Applications must supply verified timing inputs; unknown products must not be
mapped to a guessed range.

## Origin and scope

Inspired by calendar problems encountered while developing Wondroot. This is
new standalone code with synthetic examples, not a copy of the private store
repository or its history. Wondroot production remains on its existing shared
resolver. This library has not replaced or changed any live promise.

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).
MIT licensed. Report reproducible bugs through the repository's Issues tab.

Maintained by [Thái Văn Tuấn](https://github.com/tuanthaidnc), who operates
[Wondroot](https://wondroot.com). See the [roadmap](ROADMAP.md) for proposed work
and current limits. Feedback with reproducible synthetic examples is welcome.
