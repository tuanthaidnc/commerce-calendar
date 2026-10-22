# Roadmap

This is an early-stage library. Plans are proposals, not shipped functionality
or a promise of dates. Prioritize reproducible user problems over feature count.

## Current

- Source release 0.1.0, explicit business calendars and sequential delivery ranges.
- Automated regression tests on Node 20, 22 and 24.
- Main includes installation of the packed tarball in a separate consumer,
  verifying public imports and documented example dates before npm distribution.
- No verified external adoption or production integration yet.

## Next

1. Gather real feedback on calendar semantics and documentation.
2. Validate TypeScript declarations in a typed consumer before considering npm
   distribution (runtime package installation is already checked).
3. Evaluate opt-in order cutoff rules only after defining time-zone/DST behavior.

## Contributing useful feedback

Use the issue templates with synthetic examples. If you use the library, an
optional public integration link helps establish real use. Do not share private
business data. Stars, forks and test downloads are not proof of production use.
