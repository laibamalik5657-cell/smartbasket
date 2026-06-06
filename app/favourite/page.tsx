"use client";
import React, { useState } from 'react'
import page from '../page';
interface FavItem {
    id: number;
    name: string;
    price: string;
    image: string;
}

export default function Favourite() {
    // 1. Favorites State Data
    const [favItems, setFavItems] = useState<FavItem[]>([
        { id: 1, name: "Fresh Red Apples", price: "Rs.150", image: "🍎" },
        { id: 2, name: "Organic Bananas", price: "Rs.100", image: "🍌" },
        { id: 3, name: "Fresh Whole Milk", price: "Rs.25", image: "🥛" },
        { id: 4, name: "Green Broccoli", price: "Rs.100`", image: "🥦" }
    ]);
    // 2. Remove Item Function
    const handleRemoveItem = (id: number) => {
        const updatedList = favItems.filter(item => item.id !== id);
        setFavItems(updatedList);
    };
    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Heading */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
                <p className="text-gray-600 mb-8">Items you saved to buy later.</p>

                {/* Empty State vs List Grid */}
                {favItems.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-lg mb-4">Your favorites list is empty!</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            Reset Items
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {favItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition"
                            >
                                {/* Left Side: Icon & Details */}
                                <div className="flex items-center gap-4">
                                    <span className="text-4xl">{item.image}</span>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{item.name}</h3>
                                        <p className="text-green-600 font-semibold text-sm">{item.price}</p>
                                    </div>
                                </div>

                                {/* Right Side: Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        className="bg-green-100 text-green-700 font-medium text-xs px-3 py-2 rounded-lg hover:bg-green-200 transition"
                                        onClick={() => alert(`${item.name} added to cart!`)}
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition text-sm"
                                        onClick={() => handleRemoveItem(item.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );


}
