# Web App Framework Examples

This folder includes example Web Apps divided by framework. Each Web
App calls one or more SystemLink APIs.

## Features

**API Integration** Each example web app calls a SystemLink API. The examples
demonstrate how to use an API both from within a SystemLink environment as well
as how to call the API outside of that environment (which is useful for
Development). The difference between the API calls from within and outside of a
SystemLink Environment are explained in greater detail in
[dev notes](../Dev%20Tools/DEV_NOTES.md).

**Nimble Components/Styling** The web apps use
[Nimble](https://nimble.ni.dev/), SystemLink's design library, to keep custom
web apps' components and styling (fonts, colors, etc.) uniform with the
SystemLink hosting environment.

## Live Demos

Browse the hosted examples without needing a SystemLink environment:

| App | Framework | Live Demo |
|-----|-----------|-----------|
| SystemLink Auth Example | React | [Open →](https://ni.github.io/systemlink-enterprise-examples/React/SystemLinkAuthExample/) |
| SystemLink Auth Example | Blazor | [Open →](https://ni.github.io/systemlink-enterprise-examples/Blazor/SystemLinkAuthExample/) |

## Included Frameworks

JavaScript/TypeScript:

- [React](./React/)
- [Angular](./Angular/)

.NET:

- [Blazor](./Blazor/)
