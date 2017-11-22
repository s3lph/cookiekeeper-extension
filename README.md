# CookieKeeper

A Chrome extension that allows the user to keep single cookies stored across sessions when cookies are set to be
non-persistent across sessions.

## Why would I need this?

Do you have your browser configured to delete all cookies upon closing? Do you sometimes with for some cookies to stay
around either way? But you don't want to create exceptions for whole domains just to keep a single cookie? Then this
extension is for you.

### Use cases

- YouTube options, e.g. autoplay or the dark theme: Simply keep the `PREF` cookie around.
- Avoiding constant reauthentication in web-based messengers: Simply keep the session cookie(-s).
- …

## How does it work?

If you want to keep a cookie persistent, open the BrowserAction popup and click the `+` button for the corresponding
cookie. If you want to remove a cookie from persistent storage, either click the same button (now a `-`) again or go to
the extension's option page.

Every time a cookie registered in the extension changes, the extension writes a copy of this cookie to local storage.
When starting the browser, all stored cookies are loaded and restored.

## What does it need this many permissions for?

- `<all_urls>` and `cookies` are required to access the cookies for arbitrary domains.
- `storage` is required to write saved cookies to local storage. The cookies are not synced between devices.
- `tabs` is required to figure out which website is currently active, so the popup can show the correct cookies.

## TODO

- Better UI/UX.
