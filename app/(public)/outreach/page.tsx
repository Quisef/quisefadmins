import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Youth Empowerment | QuiSEF',
  description:
    'How the Quiet Shelter Empowerment Foundation is building the next generation of Nigerian entrepreneurs through the Future Entrepreneurship Initiative.',
  openGraph: {
    title: 'Youth Empowerment | QuiSEF',
    description:
      'How QuiSEF is building the next generation of Nigerian entrepreneurs, beginning with NYSC corps members in Adamawa State.',
    type: 'article',
    publishedTime: '2026-02-12T00:00:00+01:00',
    images: ['/images/official-unveiling.jpg'],
  },
};

const programmeStages = [
  {
    number: '01',
    title: 'Capacity building',
    description: 'Virtual training that gives participants practical foundations for starting and growing a business.',
  },
  {
    number: '02',
    title: 'Mentorship',
    description: 'Virtual and in-person guidance from experienced entrepreneurs and professionals.',
  },
  {
    number: '03',
    title: 'Business plan competition',
    description: 'Top performers become eligible for seed grants and business starter packs.',
  },
  {
    number: '04',
    title: 'Lifetime alumni network',
    description: 'Continued access to entrepreneurs, mentors, partners, and investors.',
  },
];

const expansionPhases = [
  {
    phase: 'Phase 1',
    years: 'Adamawa State · 2026',
    description:
      'Deliver the first full cohort, consolidate the training, establish the mentor network, and document the model rigorously.',
  },
  {
    phase: 'Phase 2',
    years: 'Northeast Nigeria · 2027–2028',
    description:
      'Expand into Borno, Gombe, Bauchi, Taraba, and Yobe—states that share similar youth employment challenges and need structured entrepreneurship support.',
  },
  {
    phase: 'Phase 3',
    years: 'National scale · 2029–2031',
    description:
      'Work with NYSC State Coordinators, governments, corporate sponsors, and development organisations across all six geopolitical zones.',
  },
];

const galleryPhotos = [
  {
    src: '/images/field-conversation.jpg',
    alt: 'QuiSEF team members speaking with corps members after the presentation',
  },
  {
    src: '/images/registration-notebook.jpg',
    alt: 'Interested corps members recording their details for the programme',
  },
  {
    src: '/images/sign-up-desk.jpg',
    alt: 'Corps members registering at the programme sign-up desk',
  },
  {
    src: '/images/team-welcome.jpg',
    alt: 'The QuiSEF team welcoming corps members at the orientation camp',
  },
];

export default function YouthEmpowermentPage() {
  return (
    <main className="bg-[#f8f7f2] text-slate-900">
      <article>
        <header className="relative isolate min-h-[620px] overflow-hidden bg-slate-950">
          <Image
            src="/images/official-unveiling.jpg"
            alt="Official unveiling of the Future Entrepreneurship Initiative at the NYSC Orientation Camp"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />

          <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-end px-6 pb-16 pt-32 lg:px-8 lg:pb-24">
            <div className="max-w-4xl text-white">
              <div className="mb-6 flex flex-wrap items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                <span>Youth Empowerment</span>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-emerald-300" />
                <time dateTime="2026-02-12">12 February 2026</time>
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-7xl">
                Youth Empowerment: From the NYSC Camp to the Nation
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-slate-100 sm:text-2xl">
                How QuiSEF is building the next generation of Nigerian entrepreneurs.
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20 lg:px-8">
          <p className="text-xl font-medium leading-9 text-slate-800 sm:text-2xl sm:leading-10">
            Something significant happened at the NYSC Orientation Camp in Damare, Adamawa State, on 12
            February 2026. A team from the Quiet Shelter Empowerment Foundation (QuiSEF) walked into one of
            Nigeria&apos;s most concentrated gatherings of young, educated talent and asked a simple question:
          </p>

          <blockquote className="my-12 border-l-4 border-emerald-600 bg-white px-7 py-8 text-2xl font-semibold leading-10 text-slate-900 shadow-sm sm:px-10 sm:text-3xl sm:leading-12">
            What if your service year was the beginning of your entrepreneurship journey—not just twelve months
            on a clock?
          </blockquote>

          <p className="text-lg leading-8 text-slate-700">
            The response was immediate. And it told us everything we needed to know.
          </p>

          <section className="pt-16" aria-labelledby="programme-belief">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">The programme</p>
            <h2 id="programme-belief" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              A programme born from a belief
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-8 text-slate-700">
              <p>
                The Young Entrepreneurship and Empowerment Programme (YEEP), officially known as the Future
                Entrepreneurship Initiative, was unveiled by QuiSEF that same February morning. It is designed
                around a singular conviction: Nigeria&apos;s NYSC corps members are one of the country&apos;s most
                underutilised assets.
              </p>
              <p>
                Thousands of motivated and mobile young people could, with the right support, become the job
                creators their host communities desperately need.
              </p>
            </div>

            <div className="relative mt-10 aspect-[16/10] overflow-hidden rounded-3xl bg-slate-200 shadow-lg">
              <Image
                src="/images/programme-launch-address.jpg"
                alt="QuiSEF presenting the Future Entrepreneurship Initiative to corps members"
                fill
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-cover"
              />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              QuiSEF presents the Future Entrepreneurship Initiative at the NYSC Orientation Camp in Damare.
            </p>
          </section>

          <section className="pt-16" aria-labelledby="programme-structure">
            <h2 id="programme-structure" className="text-3xl font-bold tracking-tight sm:text-4xl">
              Four structured stages
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {programmeStages.map((stage) => (
                <div key={stage.number} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <span className="text-sm font-bold tracking-[0.18em] text-emerald-700">{stage.number}</span>
                  <h3 className="mt-3 text-xl font-bold">{stage.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{stage.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-xl font-semibold leading-9 text-slate-900">
              It is not a lecture series. It is not a one-day workshop. It is an opportunity designed for young
              people who are serious about building something that lasts.
            </p>
          </section>

          <section className="pt-16" aria-labelledby="camp-story">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">The launch</p>
            <h2 id="camp-story" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              At the camp: where it all started
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-8 text-slate-700">
              <p>
                When the QuiSEF team arrived at the NYSC Orientation Camp for the sensitisation exercise, they
                were not sure what to expect. Orientation camps are busy, overwhelming places. Corps members,
                freshly posted to a new state and navigating a new environment, are often more concerned with
                postings and allowances than long-term career planning.
              </p>
            </div>

            <div className="relative mt-10 aspect-[16/10] overflow-hidden rounded-3xl bg-slate-200 shadow-lg">
              <Image
                src="/images/camp-walkthrough.jpg"
                alt="The QuiSEF team engaging corps members during the camp sensitisation exercise"
                fill
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-cover"
              />
            </div>

            <div className="mt-10 space-y-6 text-lg leading-8 text-slate-700">
              <p className="text-2xl font-semibold leading-9 text-slate-900">
                What they found instead was a hunger for growth and development.
              </p>
              <p>
                Corps members crowded around the team after the presentation. They asked detailed questions
                about the curriculum, the mentors, the business plan competition, and the kinds of businesses
                that would be supported. They filled in their names and contact details with an enthusiasm that
                went well beyond polite curiosity. Many had already been thinking about business; some had ideas
                they had carried since university.
              </p>
              <p>
                By the end of the sensitisation, the team had gathered details from interested corps members
                working across agribusiness, food processing, digital services, fashion, and education
                technology. That day was not just a launch event. It was the beginning of a conversation—one
                that QuiSEF intends to keep going for years to come.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {galleryPhotos.map((photo) => (
                <figure key={photo.src} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 640px) 448px, 100vw"
                    className="object-cover transition duration-500 hover:scale-105"
                  />
                </figure>
              ))}
            </div>
          </section>

          <section className="pt-16" aria-labelledby="national-scale">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">The five-year vision</p>
            <h2 id="national-scale" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              A model built to scale: from Adamawa to the nation
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-8 text-slate-700">
              <p>
                The Future Entrepreneurship Initiative begins in Adamawa, but it was never designed to stay
                there. The state has faced displacement, conflict, and economic disruption, yet it is also home
                to extraordinary resilience and a deeply entrepreneurial spirit. If a programme can work here,
                in one of Nigeria&apos;s most challenging operating environments, it can work anywhere.
              </p>
            </div>

            <div className="my-12 rounded-3xl bg-emerald-800 px-7 py-10 text-white sm:px-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">Our goal by 2031</p>
              <p className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Reach 6,000 young Nigerians</p>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-50">
                The pathway is phased and deliberate, beginning with a full Adamawa cohort and growing into a
                national network.
              </p>
            </div>

            <div className="space-y-5">
              {expansionPhases.map((item) => (
                <div
                  key={item.phase}
                  className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-[140px_1fr] sm:gap-6"
                >
                  <p className="font-bold text-emerald-700">{item.phase}</p>
                  <div>
                    <h3 className="text-xl font-bold">{item.years}</h3>
                    <p className="mt-3 leading-7 text-slate-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 space-y-6 text-lg leading-8 text-slate-700">
              <p>
                By 2031, we envision a federated network of YEEP alumni enterprises across Nigeria: thousands
                of small and medium businesses generating employment and economic activity in communities that
                have long been written off as unproductive, and changing the story of what it means to be young,
                educated, and Nigerian.
              </p>
              <p className="text-2xl font-semibold leading-9 text-slate-900">
                This is not a dream. It is a plan. And it begins with the corps members who signed up at Damare
                camp on a February morning.
              </p>
            </div>

            <div className="relative mt-10 aspect-[16/10] overflow-hidden rounded-3xl bg-slate-200 shadow-lg">
              <Image
                src="/images/team-group-photo.jpg"
                alt="The QuiSEF team at the NYSC Orientation Camp outreach"
                fill
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-cover"
              />
            </div>
          </section>
        </div>

        <section className="bg-slate-950 px-6 py-16 text-white sm:py-20 lg:px-8" aria-labelledby="join-us">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">Take part</p>
            <h2 id="join-us" className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Join us
            </h2>
            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-200">
              The Future Entrepreneurship Initiative is bigger than QuiSEF and bigger than Adamawa. At its core,
              it is a bet on Nigerian youth—and we invite you to place that bet alongside us.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/donation"
                className="rounded-md bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              >
                Support the programme
              </Link>
              <Link
                href="/contacts"
                className="rounded-md border border-white/30 px-6 py-3 font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Partner with QuiSEF
              </Link>
            </div>

            <div className="mt-12 grid gap-8 border-t border-white/15 pt-8 text-slate-300 sm:grid-cols-2">
              <div>
                <p className="font-semibold text-white">General inquiries</p>
                <a className="mt-2 block hover:text-emerald-300" href="mailto:info@quietshelter.org">
                  info@quietshelter.org
                </a>
                <a className="mt-1 block hover:text-emerald-300" href="tel:+2348031878687">
                  0803 187 8687
                </a>
              </div>
              <div>
                <p className="font-semibold text-white">Programme contact</p>
                <p className="mt-2">Ibitomi Otunola</p>
                <a className="mt-1 block hover:text-emerald-300" href="tel:+2348084936158">
                  0808 493 6158
                </a>
              </div>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
