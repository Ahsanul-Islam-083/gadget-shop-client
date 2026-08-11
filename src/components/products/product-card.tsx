"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/api";
import { formatMoney } from "@/lib/format";
import { RatingStars } from "@/components/products/rating-stars";

export function ProductCard({ product }: { product: Product }) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 dark:border-slate-800/80 dark:bg-[#0d1117] dark:hover:border-cyan-400/50 dark:hover:shadow-cyan-950/30"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-[#161b22]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center font-mono text-xs text-slate-400 dark:text-slate-600">
            [ NO IMAGE SIGNAL ]
          </span>
        )}

        {/* Stock Badge Overlay */}
        <div className="absolute top-2 left-2">
          {isOutOfStock ? (
            <span className="rounded-full border border-red-500/40 bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 backdrop-blur-md dark:text-red-400">
              Depleted
            </span>
          ) : isLowStock ? (
            <span className="rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 backdrop-blur-md dark:text-amber-400">
              Only {product.stock} Left
            </span>
          ) : null}
        </div>

        {/* Category Pill Tag */}
        <div className="absolute bottom-2 right-2">
          <span className="rounded-md border border-slate-200/60 bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-700 backdrop-blur-md dark:border-slate-700/60 dark:bg-black/60 dark:text-slate-300">
            {product.category.name}
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="flex flex-1 flex-col gap-1.5 p-2 pt-3">
        {product.brand && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            {product.brand}
          </p>
        )}

        <h3 className="line-clamp-1 font-heading text-base font-bold text-slate-900 transition-colors group-hover:text-cyan-500 dark:text-slate-100 dark:group-hover:text-cyan-400">
          {product.title}
        </h3>

        {/* Rating summary */}
        <div className="flex items-center gap-1.5 pt-0.5">
          {product.ratingCount > 0 ? (
            <>
              <RatingStars value={product.avgRating ?? 0} size={13} />
              <span className="font-mono text-xs font-semibold text-amber-500">
                {product.avgRating?.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-400">
                ({product.ratingCount})
              </span>
            </>
          ) : (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              New release
            </span>
          )}
        </div>

        {/* Bottom Price Bar */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400">
              Price
            </span>
            <p className="font-mono text-lg font-extrabold text-slate-900 dark:text-white">
              {formatMoney(product.price)}
            </p>
          </div>

          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-700 transition group-hover:border-cyan-500/50 group-hover:bg-cyan-500 group-hover:text-black dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}