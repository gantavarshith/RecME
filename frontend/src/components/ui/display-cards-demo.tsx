"use client";
import React from "react";
import { DisplayCards } from "./display-cards";
import { Sparkles, TrendingUp, Film } from "lucide-react";

export function DisplayCardsDemo() {
  const cards = [
    {
      title: "Featured",
      description: "Handpicked just for you based on your unique taste profile.",
      image:
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      title: "Popular",
      description: "Trending this week 🔥 — what audiences worldwide are loving.",
      image:
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=600",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      title: "New Releases",
      description: "Latest additions fresh from the studio, ready to watch.",
      image:
        "https://images.unsplash.com/photo-1440404653325-ab127d499117?auto=format&fit=crop&q=80&w=600",
      icon: <Film className="w-4 h-4" />,
    },
  ];

  return <DisplayCards cards={cards} />;
}
