import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Users,
  FileText,
} from "lucide-react";
import { AdvancedMarquee } from "../components/AdvancedMarquee";

export const HomePage: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Real-time updates every 5 seconds",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Shield,
      title: "Secure Checkout",
      description: "Safe and encrypted transactions",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Clock,
      title: "5-Minute Reservations",
      description: "Hassle-free checkout window",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  const stats = [
    { value: "1000+", label: "Concurrent Users", icon: Users },
    { value: "5min", label: "Reservation Window", icon: Clock },
    { value: "Real-time", label: "Stock Updates", icon: TrendingUp },
  ];

  const openArchitectureDiagram = () => {
    window.open("/images/Architechural_Diagram.jpg", "_blank");
  };

  return (
    <div className="space-y-20">
      <section className="text-center space-y-8">
        <AdvancedMarquee
          speed={{ fast: 1.5, slow: 0.3 }}
          messages={[
            "LIMITED EDITION DROPS — SHOP BEFORE THEY'RE GONE!",
            "5-MINUTE RESERVATIONS — ACT FAST!",
            "REAL-TIME STOCK UPDATES — EVERY 5 SECONDS!",
            "EXCLUSIVE ITEMS — LIMITED QUANTITIES!",
            "SECURE CHECKOUT — SAFE & ENCRYPTED!",
            "1000+ CONCURRENT USERS — TRUSTED SYSTEM!",
          ]}
        />

        <div className="flex flex-col items-center gap-2 bg-sky-500 text-green-600 px-4 py-2 rounded-full text-sm font-medium">
          <h1 className="text-2xl sm:text-6xl font-bold">
            Well Come To Drops Zone
          </h1>
          <span className="text-2xl sm:text-4xl font-bold">
            Notice that Only Limited Edition Drops are Available Now
          </span>
        </div>

        <h1 className="text-3xl md:text-7xl font-bold text-gray-900 leading-tight">
          Get Your Hands on{" "}
          <span className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Exclusive Items
          </span>
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-bold">
          Secure limited-stock products before they're gone. Real-time
          inventory, automatic reservations, and instant checkout.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Shop Now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/health"
            className="inline-flex items-center gap-2 bg-sky-500 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300"
          >
            System Status
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, _) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="group text-center p-8 bg-purple-400 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div
                className={`inline-flex p-4 bg-linear-to-r ${feature.color} rounded-2xl mb-5 shadow-lg`}
              >
                <Icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </section>

      <section className="text-center py-8">
        <div className="bg-linear-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            System Architecture
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            View the complete architecture diagram of the limited-stock product
            drop system, including frontend, backend, database, and all
            components.
          </p>
          <button
            onClick={openArchitectureDiagram}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <FileText className="h-5 w-5" />
            View Full Architecture Diagram
          </button>
        </div>
      </section>

      <section className="bg-linear-to-r from-indigo-400 via-purple-300 to-pink-400 rounded-2xl p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="space-y-2">
                <div className="inline-flex p-3 bg-white rounded-full shadow-md">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mt-3">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
