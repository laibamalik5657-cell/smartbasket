import Link from "next/link";

const categories = [
  { name: "Vegetables", emoji: "/dashboard/carrots.png", tint: "bg-red-50" },
  { name: "Fruits", emoji: "/dashboard/apple.png", tint: "bg-green-50" },
  { name: "Dairy", emoji: "/dashboard/milk-bottle.png", tint: "bg-blue-50" },
  { name: "Bakery", emoji: "/dashboard/white-bread.png", tint: "bg-amber-50" },
  { name: "Meat", emoji: "/dashboard/chicken.png", tint: "bg-rose-50" },
  { name: "Beverages", emoji: "/dashboard/drink.png", tint: "bg-orange-50" },
  { name: "Snacks", emoji: "/dashboard/popcorn.png", tint: "bg-yellow-50" },
  { name: "Frozen", emoji: "/dashboard/ice-cream.png", tint: "bg-sky-50" },
];

const products = [
  { name: "Bananas", price: "Rs.250", unit: "/ dozen", emoji: "/products/bananas.png", tag: "Fresh" },
  { name: "bread", price: "Rs.180", unit: "/ 1 pack", emoji: "/products/white-bread.png", tag: "Best Seller" },
  { name: "Milk", price: "Rs.220", unit: "/ 1L", emoji: "/products/milk.png", tag: "Daily" },
  { name: "Flour", price: "Rs.1100", unit: "/ 10 kg", emoji: "/products/flour.png", tag: "Bakery" },
  { name: "Rice", price: "Rs.400", unit: "/ 1 kg", emoji: "/products/rice.png", tag: "Seasonal" },
  { name: "Eggs", price: "Rs.350", unit: "/1 dozen", emoji: "/products/eggs.png", tag: "Organic" },
  { name: "Cooking oil", price: "Rs.520", unit: "/1 kg", emoji: "/products/oil.png", tag: "Pantry" },
  { name: "Chips", price: "Rs.60", unit: "/1 pack", emoji: "/products/milk.png", tag: "Fresh" },
];

const features = [
  {
    title: "Free delivery over 3km",
    body: "Same-day delivery on orders above $40 within the city. ",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Always fresh",
    body: "Sourced daily from local farms — quality guaranteed or your money back.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M22 4 12 14.01l-3-3" />
      </svg>
    ),
  },
  {
    title: "Cancel Order Before Dispatched",
    body: "Changed your mind? Cancel your order easily before it leaves our store.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
    ),
  },
  {
    title: "Secure checkout",
    body: "Encrypted payments and trusted providers keep your data safe.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-light via-white to-brand-light/40">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand shadow-sm ring-1 ring-brand/20">
              <span className="h-2 w-2 rounded-full bg-brand" />
              Same-day delivery available
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Fresh groceries,<br />
              <span className="text-brand">delivered in minutes.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted">
              Stock your kitchen with farm-fresh produce, dairy, bakery and pantry
              staples — handpicked daily and delivered to your door.
            </p>

            <form className="mt-8 flex max-w-md items-center gap-2 rounded-full bg-white p-1.5 shadow-sm ring-1 ring-border focus-within:ring-brand">
              <span className="pl-3 text-muted">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search for fruits, snacks, drinks…"
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark"
              >
                Search
              </button>
            </form>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
              <div className="flex items-center gap-2">
                <span className="text-brand">✓</span> 10,000+ products
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand">✓</span> 30-min delivery
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand">✓</span> Trusted by 50k+ families
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-6 h-40 w-40 rounded-full bg-brand/20 blur-2xl" />
            <div className="absolute -right-4 bottom-0 h-48 w-48 rounded-full bg-amber-200/40 blur-2xl" />
            <div className="relative grid grid-cols-2 gap-4">
              {[
                { e: "🥑", n: "Avocado", p: "Rs.300" },
                { e: "🍓", n: "Strawberry", p: "Rs.350" },
                { e: "🥕", n: "Carrot", p: "Rs.170" },
                { e: "🥬", n: "Lettuce", p: "Rs.320" },
              ].map((p, i) => (
                <div
                  key={p.n}
                  className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-border ${i % 2 === 1 ? "translate-y-6" : ""
                    }`}
                >
                  <div className="flex h-24 items-center justify-center rounded-xl bg-brand-light text-5xl">
                    {p.e}
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-foreground">{p.n}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm font-bold text-brand">{p.p}</span>
                      <button
                        aria-label={`Add ${p.n} to cart`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Shop by category</h2>
            <p className="mt-1 text-sm text-muted">Everything your kitchen needs, organised.</p>
          </div>
          <Link href="/" className="hidden text-sm font-medium text-brand hover:underline sm:inline">
            View all →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((c) => (
            <Link
              key={c.name}
              href="/"
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              
              <div className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${c.tint}`}>
              <img src={c.emoji} />
              </div>
              <span className="text-sm font-medium group-hover:text-brand">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Featured today</h2>
              <p className="mt-1 text-sm text-muted">Handpicked picks from our farmers and bakers.</p>
            </div>
            <Link href="/" className="hidden text-sm font-medium text-brand hover:underline sm:inline">
              See more →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <article
                key={p.name}
                className="group flex flex-col rounded-2xl border border-border bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="relative flex h-32 items-center justify-center rounded-xl bg-brand-light text-6xl">
                  <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-brand">
                    {p.tag}
                  </span>
                  <button
                    aria-label={`Favourite ${p.name}`}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-foreground shadow-sm hover:text-brand"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                 <img className="h-20 w-20" src={p.emoji} alt={p.name} />
                </div>
                <div className="mt-3 flex flex-1 flex-col">
                  
                  <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted">In stock</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-base font-bold">
                      {p.price}
                      <span className="ml-1 text-xs font-normal text-muted">{p.unit}</span>
                    </p>
                    <button className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                      Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">Why SmartBasket?</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand">
                {f.icon}
              </div>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-brand text-white">
          <div className="grid items-center gap-6 p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
                Get 20% off your first order
              </h2>
              <p className="mt-2 max-w-md text-sm text-white/90">
                Sign up for SmartBasket and we will drop a welcome coupon in your
                inbox. Fresh deals, every week.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand hover:bg-white/90"
                >
                  Create account
                </Link>
                <Link
                  href="/about"
                  className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Learn more
                </Link>
              </div>
            </div>
            <div className="hidden justify-end gap-3 lg:flex">
              {["🍇", "🥦", "🍞", "🧀"].map((e, i) => (
                <span
                  key={i}
                  className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-4xl backdrop-blur ${i % 2 === 1 ? "translate-y-4" : ""
                    }`}
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
