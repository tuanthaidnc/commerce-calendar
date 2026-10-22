# Contributing

Run `npm test` and `npm run example` using Node 20+ before proposing changes.
For calendar bugs provide a synthetic timestamp, zone, complete calendar
configuration, expected dates and actual dates. Include a regression test with
independently checked endpoints. Do not include customer records or credentials.

Keep core calculations deterministic and dependency-free. Changes to counting
semantics require documentation and explicit compatibility discussion. National
holiday rules must be opt-in and sourced; never infer observed holidays.

Use https://github.com/tuanthaidnc/commerce-calendar/issues and pull requests.
Maintainers review code before merging.
