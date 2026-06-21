import ContactForm from "./contact-form";

export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero Section */}
      <section className="bg-green-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <h1 className="text-5xl font-bold mb-4">
            Contact Us
          </h1>

          <p className="text-lg text-green-100 max-w-2xl mx-auto">
            Have questions about your order or need assistance?
            Our support team is here to help.
          </p>

        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">

          <div className="grid lg:grid-cols-3 gap-8">

            {/* Contact Info */}
            <div className="space-y-6">

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-lg mb-2">
                  📍 Address
                </h3>

                <p className="text-gray-600">
                  SmartBasket Grocery Store<br />
                  Islamabad, Pakistan
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-lg mb-2">
                  📞 Phone
                </h3>

                <p className="text-gray-600">
                  +92 300 1234567
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-lg mb-2">
                  ✉️ Email
                </h3>

                <p className="text-gray-600">
                  support@smartbasket.com
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-lg mb-2">
                  ⏰ Working Hours
                </h3>

                <p className="text-gray-600">
                  Monday - Sunday
                  <br />
                  8:00 AM - 10:00 PM
                </p>
              </div>

            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">

              <div className="bg-white p-8 rounded-xl shadow-sm">

                <h2 className="text-2xl font-bold mb-6">
                  Send Us a Message
                </h2>

                <ContactForm />

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Map Section */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6">

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">

            <div className="h-[400px] flex items-center justify-center bg-gray-200">
              <p className="text-gray-600">
                Google Map Integration Here
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}