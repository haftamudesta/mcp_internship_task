import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Clock, ShoppingBag } from "lucide-react";

export const HomePage: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Real-time updates every 5 seconds",
    },
    {
      icon: Shield,
      title: "Secure Checkout",
      description: "Safe and encrypted transactions",
    },
    {
      icon: Clock,
      title: "5-Minute Reservations",
      description: "Hassle-free checkout window",
    },
  ];

  return (
    <div className="space-y-16">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm">
          <ShoppingBag className="h-4 w-4" />
          <span>Limited Edition Drops</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
          Get Your Hands on{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Exclusive Items
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Secure limited-stock products before they're gone. Real-time
          inventory, automatic reservations, and instant checkout.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Shop Now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/health"
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            System Status
          </Link>
        </div>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="text-center p-6 bg-white rounded-xl shadow-sm"
            >
              <div className="inline-flex p-3 bg-indigo-50 rounded-full mb-4">
                <Icon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          );
        })}
      </section>
      <section className="bg-white rounded-xl shadow-sm p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-indigo-600">100+</div>
            <div className="text-sm text-gray-600 mt-1">Concurrent Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600">5min</div>
            <div className="text-sm text-gray-600 mt-1">Reservation Window</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600">Real-time</div>
            <div className="text-sm text-gray-600 mt-1">Stock Updates</div>
          </div>
        </div>
      </section>
    </div>
  );
};
