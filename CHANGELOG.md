# Changelog

All notable changes to this project are documented here. This project follows
[Semantic Versioning](https://semver.org/).

## 1.1.0

Backward-compatible — upgrade from 1.0.x with no code changes required.

### Notes for upgraders
- `icon` on a checklist step now renders in the default checklist (it was
  previously ignored there). Pass an emoji or icon component, not a bare string
  name like `"MapPin"`, or omit it.
- Floating (corner) discoveries now render automatically from config. A manual
  `<DiscoveryBanner>` for a floating tip still works but is redundant — it
  de-duplicates, so there is no double render.

### Added
- Floating discoveries auto-render from config; `<DiscoveryBanner>` is now only
  needed for inline tips.
- `ChecklistStep.icon` accepts any React node and renders in the checklist.

### Changed
- `ChecklistStep.order` is now optional — steps render in array order.
- A tour auto-completes its linked checklist step via the step's `tourId`;
  `TourConfig.checklistStepId` is now an optional override.
- A checklist task's "Go" button defaults to its linked tour's `route`.

## 1.0.1

- Initial public release.
