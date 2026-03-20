"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DisplayCardProps {
  title: string;
  description: string;
  image: string;
  icon?: React.ReactNode;
  className?: string;
}

export const DisplayCard = ({
  title,
  description,
  image,
  icon,
  className,
}: DisplayCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative group w-72 h-96 rounded-3xl overflow-hidden shadow-2xl flex-shrink-0",
        className
      )}
    >
      {/* Background Image */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-all duration-500" />

      {/* Ring Glow on hover */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 group-hover:ring-purple-400/50 transition-all duration-500" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center gap-2 mb-2">
          {icon && (
            <div className="p-1.5 bg-purple-500/30 backdrop-blur-sm rounded-lg text-purple-300">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-black text-white uppercase tracking-widest">
            {title}
          </h3>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export const DisplayCards = ({
  cards,
}: {
  cards: DisplayCardProps[];
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-6">
      {cards.map((card, index) => (
        <DisplayCard key={index} {...card} />
      ))}
    </div>
  );
};
