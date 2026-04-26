const channels = [
  {
    title: "Customer support",
    body: "We answer every email within 4 hours, 7 days a week.",
    detail: "support@smartbasket.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    title: "Phone",
    body: "Talk to a real person, Mon–Sat, 8am to 9pm.",
    detail: "+1 (555) 010-2233",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    title: "Visit us",
    body: "Our HQ is open Monday through Friday, 9am to 6pm.",
    detail: "221B Market Street, Suite 4, San Francisco",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

const faqs = [
  {
    q: "How fast is delivery?",
    a: "Most orders arrive within 30–45 minutes. You will see an exact ETA at checkout based on your address.",
  },
  {
    q: "Do you charge a delivery fee?",
    a: "Delivery is free on orders over $40. Smaller orders include a flat $3.99 fee.",
  },
  {
    q: "Can I return an item?",
    a: "Yes — if anything is not up to standard, the driver will collect it at the door and we will refund instantly.",
  },
  {
    q: "Where do you operate?",
    a: "We currently serve 8 cities across the US. New cities are added every quarter — check back soon.",
  },
];

export default function ContactPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-light via-white to-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand ring-1 ring-brand/20">
            Contact us
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            We would love to <span className="text-brand">hear from you</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            Questions, feedback, partnership ideas, or just a hello — drop us a
            note and the team will get back within a few hours.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {channels.map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
                {c.icon}
              </div>
              <h3 className="mt-4 text-base font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted">{c.body}</p>
              <p className="mt-3 text-sm font-medium text-brand">{c.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Send us a message</h2>
            <p className="mt-2 text-sm text-muted">
              Fill in the form and we will route your message to the right team.
            </p>

            <form className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium">First name</label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Maya"
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium">Last name</label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Chen"
                    className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </div>
              <div>
                <label htmlFor="topic" className="block text-sm font-medium">Topic</label>
                <select
                  id="topic"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand"
                >
                  <option>General enquiry</option>
                  <option>Order issue</option>
                  <option>Partnership</option>
                  <option>Press</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Tell us a bit about what you need…"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark sm:w-auto"
              >
                Send message
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Frequently asked</h2>
            <p className="mt-2 text-sm text-muted">
              The quick answers most people are looking for.
            </p>
            <div className="mt-6 space-y-3">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-xl border border-border bg-white p-4 open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                    {f.q}
                    <span className="text-muted transition-transform group-open:rotate-180">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
