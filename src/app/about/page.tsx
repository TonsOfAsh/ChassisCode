import type { Metadata } from 'next';
import { InfoPage } from '@/components/InfoPage';
import { CONTACT_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About ChassisCode',
  description: 'What ChassisCode is, where its car specs come from, and how to get in touch.',
  alternates: { canonical: '/about' },
};

export default function About() {
  return (
    <InfoPage title="About ChassisCode">
      <p>
        ChassisCode is a car guessing game. You get a mystery car and try to name the exact one: the right
        make, model and generation. Every wrong guess shows more of its spec sheet, like the country it comes
        from, its engine, drivetrain, power and weight.
      </p>
      <p>
        There is a new Daily car every day, the same for everyone, and an Unlimited mode with Easy, Normal and
        Hard levels for when one car a day is not enough.
      </p>

      <h3>Where the specs come from</h3>
      <p>
        Every car in the game has its own record, built from the carmaker&rsquo;s published figures and from
        tests by major car magazines. Each record is checked before it goes in. Cars whose figures could not be
        confirmed well enough are left out until they can be, or marked as provisional and kept out of the
        Daily.
      </p>
      <p>
        Spotted a wrong number? Please say so (see below), with a link to where the right figure is published.
      </p>

      <h3>Who makes it</h3>
      <p>
        ChassisCode is an independent project made by one car enthusiast. It is not connected with, or endorsed
        by, any carmaker or magazine. Car names and model names belong to their owners and are used only to
        identify the cars.
      </p>

      <h3>Get in touch</h3>
      <p>
        Questions, ideas and corrections are welcome on the{' '}
        <a href={CONTACT_URL}>ChassisCode page on GitHub</a>.
      </p>
    </InfoPage>
  );
}
