"use client";
import React from "react";
import { DisplayCards } from "./display-cards";
import { Sparkles, TrendingUp, Film } from "lucide-react";

export function DisplayCardsDemo() {
  const cards = [
    {
      title: "Featured",
      description: "Handpicked just for you based on your unique taste profile.",
      icon: <Sparkles className="w-4 h-4" />,
      href: "/movies?tag=featured",
    },
    {
      title: "New Releases",
      description: "Latest additions fresh from the studio, ready to watch.",
      icon: <Film className="w-4 h-4" />,
      href: "/movies?tag=new",
    },
  ];

  return <DisplayCards cards={cards} />;
}
