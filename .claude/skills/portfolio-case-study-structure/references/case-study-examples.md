# Case Study Examples

## ParkBunny · 2023–24 · bowline
- **The knot.** A startup with no designs, no backend plan, and no AI to test ideas on cheaply. Four kinds of people needed one platform: an admin, client managers, clients and car park managers, each allowed a different corner.
- **The pull.** I drew the map before the rooms. Roles first: who sees what, and why, agreed with the people who'd use it. Then one set of patterns every screen could lean on: filters, date pickers, and charts for money in and how busy each car park was.
- **Loose end.** One platform, four ways in, nothing leaking between them. It's still growing, and operators still change their tariffs on it in real time.
- **Margin:** No design? Then the conversation is the design.

## OLM Systems · 2024–25 · reef knot
- **The knot.** A care platform over many repos and microservices: React 17, Formik, a Storybook design system on MUI, GraphQL on top. `useMemo` everywhere, effects doing jobs they were never meant for, tests in Enzyme. Hard to tell what any line was for.
- **The pull.** Read first, change second. I traced the logic before touching it, and left each file a little easier to follow. One feature: report downloads over a WebSocket in chunks; I kept the line open, caught every piece, and stitched them into one CSV people could trust.
- **Loose end.** Reports that arrive whole, on a screen a social worker opens every day.
- **Margin:** A granny knot looks right until you pull it. Tie it again, properly.

## shaka · 2025–26 · sheet bend
- **The knot.** A startup selling eSIMs under other people's names: Deliveroo riders, Olilo, and a football fan network with a famous voice. Every partner wanted its own platform, in its own colours, yesterday.
- **The pull.** Build the root once. A monorepo with shared auth, shared components and shared CSS, and a thin layer of brand on top. Onboarding through Stripe Checkout, and a dashboard to change plans, buy roaming, cancel and come back.
- **Loose end.** Each new platform was quicker than the last, and one is open to every Deliveroo rider in the UK. → https://rideresim.com/ · https://mobile.olilo.co.uk/ · https://rocketmobile.co.uk/
- **Margin:** Different ropes, one knot to hold them.

## Novira · 2026 · figure eight
- **The knot.** Reusable containers only work if handing one back is easier than binning it. That meant three interfaces: a dashboard for the people running it, a kiosk that hands out and takes deposits, and a smart bin that has to answer every scan, straight away.
- **The pull.** Three screens, one voice. The dashboard: React 19 and the React Compiler, each role its own view. The kiosk: Stripe deposits with live payment state over WebSockets. The bin: a scan, a small animated thank-you, and ready for the next one.
- **Loose end.** Novira's partners, from canteens to shop floors, run reuse on it every day.
- **Margin:** The best answer from a bin is a quick one.
