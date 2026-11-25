type Umami = { track: (event: string, data?: Record<string, string>) => void };

/**
 * Sends an Umami event from code. Guarded: the script loads with `defer`, only
 * counts on the live domain, and can be blocked.
 *
 * Most clicks are tracked with `data-umami-event` attributes instead, but never
 * put those on a same-tab link that the app routes itself (`preventDefault` +
 * `pushState`): Umami's click listener runs first, in the capture phase, and
 * on such a link it follows `href` itself once the event is sent, so the page
 * reloads. Track those from their click handler with this.
 */
export function track(event: string, data?: Record<string, string>) {
  (window as Window & { umami?: Umami }).umami?.track(event, data);
}
