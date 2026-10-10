# Going live

The steps to put ChassisCode online, in order, and the rules that keep the Daily stable after launch.

## 1. Make the game secret

`GAME_SECRET` encrypts every game and decides every Daily answer. Make it once, on your own computer:

    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

Copy the 64-character result into a password manager. **Never change it after launch**: a new secret
gives a different car on every future day, and every game in progress stops working. Never commit it
or paste it anywhere public (the repository is public).

## 2. Choose the launch date

Puzzle #1 is the launch day. Until it comes, the site shows a separate preview puzzle each day, so
testing never reveals the real schedule. Set the date (it is 2027-01-01 as a placeholder):

    npm run daily-pool -- --launch 2026-11-01
    git add -A && git commit -m "Set launch date" && git push

The command refuses once the launch date has passed, because moving puzzle #1 after launch would
change every puzzle.

## 3. Host on Vercel

1. Sign in at vercel.com with "Continue with GitHub".
2. Add New, then Project, then import `TonsOfAsh/ChassisCode`. Vercel detects Next.js; leave the
   build settings as they are (the build runs the data bundling and the Daily pool check itself).
3. Under Environment Variables add `GAME_SECRET` with the value from step 1, for every environment.
4. Deploy. The site is then live at a free `….vercel.app` address.

From then on every push to GitHub redeploys the site. A push whose data is not in step with the
Daily pool fails to build, and the live site stays as it was.

Vercel's free Hobby plan is for non-commercial projects; check its terms if you plan ads or other
income, which need the Pro plan.

## 4. Add a domain

Buy the name (from Vercel, under Domains, or any registrar), then in the Vercel project go to
Settings, then Domains, and add it. Vercel shows the DNS records to set if it was bought elsewhere,
and issues the HTTPS certificate itself. Check names such as chassiscode.com, chassiscode.gg or
chassiscode.app for availability.

## Adding or removing cars after launch

1. Edit the records as usual and run `npm run validate`.
2. Run `npm run daily-pool`. New daily-eligible cars join the Daily from tomorrow (Pacific time);
   cars that are no longer daily-eligible, or were removed, leave after today.
3. Commit and push, at any time of day.

Today's puzzle and every earlier one never change. `npm run daily-check` tests this with a
throwaway secret (it never prints real answers).

One small exception: the clue order brings forward clues that tell the answer apart from near-twins
anywhere in the database. Adding a near-twin of today's answer during the day can change today's
clue order for players who have not started yet (never the car, and never a game in progress).

## Never

- change `GAME_SECRET`;
- move puzzle #1 (`DAILY_EPOCH` in `src/lib/daily-time.ts`) after launch;
- edit `data/daily/pool.json` by hand, or delete entries from it.
