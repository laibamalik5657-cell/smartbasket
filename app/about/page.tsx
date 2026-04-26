import Link from "next/link";

const stats = [
  { label: "Happy customers", value: "50k+" },
  { label: "Local farmers", value: "120" },
  { label: "Cities served", value: "8" },
  { label: "Avg. delivery time", value: "32 min" },
];

const values = [
  {
    title: "Sourced locally",
    body: "We partner directly with farms and bakeries in your region — fewer hops, fresher food.",
    icon: "🌱",
  },
  {
    title: "Fair pricing",
    body: "No hidden fees. Producers are paid fairly so quality stays high.",
    icon: "🤝",
  },
  {
    title: "Sustainable packaging",
    body: "Recyclable boxes and reusable cool packs keep the planet happier.",
    icon: "♻️",
  },
];

const team = [
  { name: "Aarav Patel", role: "Founder & CEO", emoji: "👨🏽‍💼" },
  { name: "Maya Chen", role: "Head of Operations", emoji: "👩🏻‍💻" },
  { name: "Liam O'Connor", role: "Logistics Lead", emoji: "🧑🏼‍🔧" },
  { name: "Zara Ahmed", role: "Customer Experience", emoji: "👩🏽‍🎤" },
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-light via-white to-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
          <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand ring-1 ring-brand/20">
            Our story
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Groceries done <span className="text-brand">honestly</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            SmartBasket started as a weekend project between three friends tired of
            wilted lettuce and surprise checkout fees. Today we help thousands of
            families get fresher food, faster.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="order-2 grid grid-cols-2 gap-4 lg:order-1">
            {["🚚", "🍅", "🥖", "🍇"].map((e, i) => (
              <div
                key={i}
                className={`flex h-40 items-center justify-center rounded-2xl bg-brand-light text-6xl ${
                  i % 2 === 1 ? "translate-y-6" : ""
                }`}
              >
                {e}
              </div>
            ))}
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-2xl font-bold sm:text-3xl">Our mission</h2>
            <p className="mt-4 text-muted">
              Make fresh, honestly-priced food accessible to everyone — without the
              friction of a weekly trip to the store. We believe convenience should
              not come at the cost of quality, and good food should not come at the
              cost of fairness for the people who grow it.
            </p>
            <p className="mt-4 text-muted">
              Every order on SmartBasket supports a local producer, uses
              recyclable packaging, and arrives in under an hour on average. That
              is the bar we hold ourselves to, every single day.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-brand sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">What we stand for</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">
            Three principles guide every decision we make — from the produce we
            stock to the drivers we hire.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-border bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-2xl">
                {v.icon}
              </div>
              <h3 className="mt-4 text-base font-semibold">{v.title}</h3>
              <p className="mt-1 text-sm text-muted">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">The people behind it</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">
              A small, passionate team obsessed with food, logistics, and getting
              the details right.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <div key={m.name} className="rounded-2xl border border-border bg-white p-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-light text-4xl">
                  {m.emoji}
                </div>
                <h3 className="mt-4 text-base font-semibold">{m.name}</h3>
                <p className="text-sm text-muted">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-brand p-10 text-center text-white sm:p-16">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to taste the difference?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/90">
            Join thousands of families who shop fresher, faster, and fairer with
            SmartBasket.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand hover:bg-white/90"
            >
              Create your account
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
