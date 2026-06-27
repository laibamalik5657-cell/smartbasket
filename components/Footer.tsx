import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M3 6h18l-2 13H5L3 6z" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </span>
            <span className="text-base font-bold">SmartBasket</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Fresh groceries delivered to your door in minutes. Quality you can
            taste, prices you will love.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-brand">Fruits & Vegetables</Link></li>
            <li><Link href="/" className="hover:text-brand">Dairy & Eggs</Link></li>
            <li><Link href="/" className="hover:text-brand">Bakery</Link></li>
            <li><Link href="/" className="hover:text-brand">Beverages</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-brand">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-brand">Contact Us</Link></li>
            <li><Link href="/" className="hover:text-brand">Careers</Link></li>
            <li><Link href="/" className="hover:text-brand">Press</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Stay in the loop</h4>
          <p className="mt-3 text-sm text-muted-foreground">
            Get weekly deals and seasonal recipes in your inbox.
          </p>
          <form className="mt-3 flex gap-2">
            <input
              type="email"
              placeholder="Email address"
              className="min-w-0 flex-1 rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <button
              type="submit"
              className="rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} SmartBasket. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-brand">Privacy</Link>
            <Link href="/" className="hover:text-brand">Terms</Link>
            <Link href="/" className="hover:text-brand">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
