"use client";

import React from "react";

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">
            About Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mt-3 tracking-tight">
            Welcome to <span className="text-green-600">Smart Basket</span>
          </h1>
          <p className="text-gray-500 mt-4 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            We are redefining grocery shopping by bringing fresh, premium quality daily essentials directly from the local markets to your doorstep with real-time speed.
          </p>
        </div>

        {/* Core Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto text-green-600">
              🥦
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Fresh Quality</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Handpicked fruits, vegetables, and daily essentials packed with ultimate hygienic care.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto text-amber-600">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Fast Delivery</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              No more waiting in long queues. Get your basket delivered instantly when you need it.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto text-blue-600">
              🇵🇰
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Local Values</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Supporting local brands and offering genuine products priced natively in Pakistani Rupees.
            </p>
          </div>

        </div>

        {/* Mission Statement Block */}
        <div className="bg-linear-to-br from-green-600 to-emerald-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Core Mission</h2>
            <p className="text-green-50 text-base sm:text-lg leading-relaxed mb-6 opacity-90">
              Smart Basket is built with a vision to make everyday living effortless. By seamlessly connecting smart administration, efficient riders, and valued customers, we ensure that your kitchen inventory stays full without any hassle.
            </p>
            <div className="flex gap-4 text-sm font-semibold text-green-100">
              <div>✓ Verified Vendors</div>
              <div>•</div>
              <div>✓ Secure Ecosystem</div>
              <div>•</div>
              <div>✓ Customer First</div>
            </div>
          </div>
          
          {/* Subtle background graphic circle decoration */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white opacity-10 rounded-full blur-xl"></div>
        </div>

      </div>
    </div>
  );
}