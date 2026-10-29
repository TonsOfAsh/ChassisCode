import type { Metadata } from 'next';
import { InfoPage } from '@/components/InfoPage';
import { CONTACT_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy policy · ChassisCode',
  description: 'What ChassisCode keeps about you (very little) and where it is kept.',
  alternates: { canonical: '/privacy' },
};

/** Change this date whenever the policy changes. */
const UPDATED = '28 October 2026';

export default function Privacy() {
  return (
    <InfoPage title="Privacy policy">
      <p className="info-updated">Last updated {UPDATED}</p>
      <p>
        The short version: ChassisCode has no accounts, does not ask for your name or email, and sets no
        cookies. Your stats stay on your own device.
      </p>

      <h3>What is kept on your device</h3>
      <p>
        The game uses your browser&rsquo;s local storage, on your device only, to remember:
      </p>
      <ul>
        <li>your stats and streak;</li>
        <li>today&rsquo;s Daily game, so you can come back to it;</li>
        <li>the difficulty you picked last;</li>
        <li>whether you have already seen the How to play guide.</li>
      </ul>
      <p>
        This is not sent to us. Clearing your browser&rsquo;s site data for chassiscode.app deletes it, and
        resets your stats.
      </p>

      <h3>What is sent to our server</h3>
      <p>
        When you start a game or make a guess, your browser contacts our server, which checks the guess and
        sends back the clues. We do not keep these guesses: there is no database, and the game in progress
        travels back and forth in an encrypted code held by your browser.
      </p>

      <h3>Hosting</h3>
      <p>
        The site is hosted by Vercel. Like any web host, Vercel receives the technical details every browser
        sends when it loads a page (such as your IP address and browser type) in order to deliver the site and
        keep it secure. See <a href="https://vercel.com/legal/privacy-policy">Vercel&rsquo;s privacy policy</a>.
      </p>

      <h3>Visit counts</h3>
      <p>
        We use Vercel Web Analytics to count visits: how many people play, which pages they view, and broad
        details such as country, device type and the site that linked to us. It uses no cookies and does not
        identify you or follow you to other sites. We see only totals.
      </p>

      <h3>Advertising</h3>
      <p>
        There are no ads on ChassisCode at the moment. If ads are added, this policy will be updated first to
        explain what they collect, and you will be asked for consent where the law requires it.
      </p>

      <h3>Children</h3>
      <p>
        ChassisCode is a general audience game and does not knowingly collect personal information from
        anyone, including children.
      </p>

      <h3>Changes and contact</h3>
      <p>
        If this policy changes, the new version will be posted here with a new date. Questions are welcome on
        the <a href={CONTACT_URL}>ChassisCode page on GitHub</a>.
      </p>
    </InfoPage>
  );
}
