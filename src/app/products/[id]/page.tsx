"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchProduct, fetchProductReviews } from "@/lib/api/products";
import { createReview, listReviews } from "@/lib/api/reviews";
import { fetchWishlist, toggleWishlist } from "@/lib/api/wishlist";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { ApiError } from "@/lib/api/client";
import { formatDate, formatMoney } from "@/lib/format";
import { PageSpinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { RatingStars } from "@/components/products/rating-stars";
import { ProductDetailSkeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/admin/toast";
import type {
  Pagination as PaginationType,
  Product,
  Review,
} from "@/types/api";

const REVIEWS_PAGE_SIZE = 5;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { status: authStatus } = useAuth();
  const { addItem } = useCart();

  // Product state
  const [productKey, setProductKey] = useState(id);
  const [product, setProduct] = useState<Product | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [productLoading, setProductLoading] = useState(true);

  if (productKey !== id) {
    setProductKey(id);
    setProduct(null);
    setProductError(null);
    setProductLoading(true);
  }

  // Reviews state
  const [page, setPage] = useState(1);
  const [reviewsRefresh, setReviewsRefresh] = useState(0);
  const reviewsKey = `${id}:${page}:${reviewsRefresh}`;

  const [loadedReviewsKey, setLoadedReviewsKey] = useState(reviewsKey);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewPagination, setReviewPagination] = useState<PaginationType | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  if (loadedReviewsKey !== reviewsKey) {
    setLoadedReviewsKey(reviewsKey);
    setReviews([]);
    setReviewPagination(null);
    setReviewsLoading(true);
  }

  // User's existing review on this product
  const [myReviewsKey, setMyReviewsKey] = useState("");
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const targetMyReviewsKey = authStatus === "authed" ? `authed:${id}` : "anon";

  if (myReviewsKey !== targetMyReviewsKey) {
    setMyReviewsKey(targetMyReviewsKey);
    setMyReviews([]);
  }

  const hasReviewed = myReviews.length > 0;

  // Wishlist state
  const [wishlistKey, setWishlistKey] = useState("");
  const [inWishlist, setInWishlist] = useState(false);
  const targetWishlistKey = authStatus === "authed" ? `authed:${id}` : "anon";

  if (wishlistKey !== targetWishlistKey) {
    setWishlistKey(targetWishlistKey);
    setInWishlist(false);
  }

  // Cart / Wishlist action pending state
  const [cartPending, setCartPending] = useState(false);
  const [wishlistPending, setWishlistPending] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  // Review form
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Get current user's review for this product
  useEffect(() => {
    if (authStatus !== "authed") return;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    listReviews(
      {
        productId: id,
        page: 1,
        pageSize: 10,
      },
      controller.signal
    )
      .then((res) => {
        if (controller.signal.aborted) return;
        setMyReviews(res.data);
      })
      .catch(() => undefined);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [authStatus, id]);

  // Fetch user's wishlist
  useEffect(() => {
    if (authStatus !== "authed") return;

    let cancelled = false;
    fetchWishlist()
      .then((res) => {
        if (cancelled) return;
        setInWishlist(res.items.some((item) => item.productId === id));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [authStatus, id]);

  // Fetch product data
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    fetchProduct(productKey, controller.signal)
      .then((p) => {
        if (controller.signal.aborted) return;
        setProduct(p);
        setProductLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setProductError(
          err instanceof ApiError ? err.message : "Failed to load product."
        );
        setProductLoading(false);
      })
      .finally(() => clearTimeout(timer));

    return () => controller.abort();
  }, [productKey]);

  // Fetch reviews
  useEffect(() => {
    const controller = new AbortController();

    fetchProductReviews(
      id,
      {
        page,
        pageSize: REVIEWS_PAGE_SIZE,
      },
      controller.signal
    )
      .then((res) => {
        if (controller.signal.aborted) return;
        setReviews(res.data);
        setReviewPagination(res.pagination);
        setReviewsLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setReviews([]);
        setReviewPagination(null);
        setReviewsLoading(false);
      });

    return () => controller.abort();
  }, [id, page, reviewsRefresh]);

  // Add to cart with feedback
  async function handleAddToCart() {
    setCartPending(true);
    setCartMessage(null);

    try {
      await addItem(id);
      setCartMessage("Added to cart");
      toast("Added to cart", "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Failed to add to cart.",
        "error"
      );
    } finally {
      setCartPending(false);
    }
  }

  // Wishlist toggle with feedback
  async function handleWishlistToggle() {
    setWishlistPending(true);

    try {
      const res = await toggleWishlist(id);
      setInWishlist(res.inWishlist);
      toast(
        res.inWishlist ? "Saved to wishlist" : "Removed from wishlist",
        "success"
      );
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Failed to update wishlist.",
        "error"
      );
    } finally {
      setWishlistPending(false);
    }
  }

  // Submit review with validation and feedback
  async function handleReviewSubmit(event: FormEvent) {
    event.preventDefault();

    if (formRating < 1) {
      setFormError("Please select a rating from 1 to 5 stars.");
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      const review = await createReview({
        productId: id,
        rating: formRating,
        comment: formComment.trim() || null,
      });

      // Disable review form after successful submission
      setMyReviews([review]);
      setFormRating(0);
      setFormComment("");
      setPage(1);
      setReviewsRefresh((r) => r + 1);

      toast("Review submitted successfully", "success");

      // Refresh product rating
      fetchProduct(id)
        .then((p) => setProduct(p))
        .catch(() => undefined);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to submit review.";
      setFormError(msg);
      toast(msg, "error");
    } finally {
      setFormSubmitting(false);
    }
  }

  // Loading skeleton
  if (productLoading) {
    return <ProductDetailSkeleton />;
  }

  // Error / product not found
  if (productError || !product) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center">
        <h1 className="mb-3 text-2xl font-bold">Product not found</h1>
        <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
          {productError ?? "This product does not exist or is no longer available."}
        </p>
        <Link
          href="/products"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          Back to products
        </Link>
      </div>
    );
  }

  const signInHref = `/login?next=${encodeURIComponent(`/products/${id}`)}`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Breadcrumb */}
      <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
        <Link href="/products" className="hover:underline">
          ← All products
        </Link>
      </p>

      {/* Product section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized
              className="object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-neutral-400 dark:text-neutral-600">
              No image
            </span>
          )}
        </div>

        {/* Product information */}
        <div>
          {/* Category */}
          <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {product.category.name}
          </p>

          {/* Title */}
          <h1 className="mt-1 text-2xl font-bold">{product.title}</h1>

          {/* Brand */}
          {product.brand && (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {product.brand}
            </p>
          )}

          {/* Product rating */}
          {product.ratingCount > 0 ? (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <RatingStars value={product.avgRating ?? 0} size={16} />
              <span className="font-medium">{product.avgRating?.toFixed(1)}</span>
              <span className="text-neutral-600 dark:text-neutral-400">
                ({product.ratingCount} review{product.ratingCount === 1 ? "" : "s"})
              </span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              No reviews yet
            </p>
          )}

          {/* Price */}
          <p className="mt-4 text-3xl font-semibold">
            {formatMoney(product.price)}
          </p>

          {/* Stock */}
          <p
            className={`mt-2 text-sm ${
              product.stock > 0
                ? "text-green-700 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {product.stock > 0
              ? `In stock (${product.stock})`
              : "Out of stock"}
          </p>

          {/* Description */}
          {product.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              {product.description}
            </p>
          )}

          {/* Cart / wishlist buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {/* Add to cart */}
            {authStatus === "authed" ? (
              <button
                type="button"
                disabled={cartPending || product.stock <= 0}
                onClick={handleAddToCart}
                className="flex-1 rounded-xl bg-cyan-500 px-6 py-3.5 font-heading text-sm font-bold text-black shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400 hover:shadow-cyan-400/40 disabled:opacity-50"
              >
                {cartPending
                  ? "Adding…"
                  : cartMessage
                    ? `${cartMessage} ✓`
                    : product.stock > 0
                      ? "Add to Cart 🛒"
                      : "Out of Stock"}
              </button>
            ) : (
              <Link
                href={signInHref}
                className="flex-1 rounded-xl bg-cyan-500 px-6 py-3.5 text-center font-heading text-sm font-bold text-black shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400"
              >
                Sign in to Purchase
              </Link>
            )}

            {/* Wishlist */}
            {authStatus === "authed" ? (
              <button
                type="button"
                disabled={wishlistPending}
                onClick={handleWishlistToggle}
                className={`rounded-xl border px-6 py-3.5 font-heading text-sm font-semibold transition-all ${
                  inWishlist
                    ? "border-pink-500/50 bg-pink-500/10 text-pink-500 dark:border-pink-400/50 dark:text-pink-400"
                    : "border-slate-300 bg-white text-slate-700 hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-pink-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-pink-400/50 dark:hover:text-pink-400"
                } disabled:opacity-60`}
              >
                {inWishlist ? "♥ Saved in Wishlist" : "♡ Save to Wishlist"}
              </button>
            ) : (
              <Link
                href={signInHref}
                className="rounded-xl border border-slate-300 px-6 py-3.5 text-center font-heading text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                ♡ Save to Wishlist
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800">
        <h2 className="mb-6 text-xl font-bold">Reviews</h2>

        {/* Review form */}
        {authStatus === "authed" ? (
          hasReviewed ? (
            <p className="mb-6 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
              You have already reviewed this product. One review per product is allowed.
            </p>
          ) : (
            <form
              onSubmit={handleReviewSubmit}
              className="mb-8 rounded-md border border-neutral-200 p-5 dark:border-neutral-800"
            >
              <h3 className="mb-3 text-base font-semibold">Write a review</h3>

              {/* Rating */}
              <div className="mb-3">
                <span className="mb-1 block text-sm font-medium">Rating</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      aria-label={`${v} star${v === 1 ? "" : "s"}`}
                      onClick={() => setFormRating(v)}
                      className={`p-0.5 text-2xl leading-none transition ${
                        formRating >= v
                          ? "text-yellow-400"
                          : "text-neutral-300 dark:text-neutral-600"
                      } hover:text-yellow-400`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {formRating > 0 ? `${formRating} / 5` : "Select a rating"}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <label
                htmlFor="review-comment"
                className="mb-1 block text-sm font-medium"
              >
                Comment (optional)
              </label>
              <textarea
                id="review-comment"
                rows={4}
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                maxLength={1000}
                className="mb-3 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />

              {/* Form error */}
              {formError && (
                <p
                  role="alert"
                  className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                >
                  {formError}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={formSubmitting}
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
              >
                {formSubmitting ? "Submitting…" : "Submit review"}
              </button>
            </form>
          )
        ) : (
          <p className="mb-8 text-sm text-neutral-600 dark:text-neutral-400">
            <Link
              href={signInHref}
              className="font-medium underline underline-offset-2"
            >
              Sign in
            </Link>{" "}
            to write a review.
          </p>
        )}

        {/* Reviews list */}
        {reviewsLoading ? (
          <PageSpinner />
        ) : reviews.length === 0 ? (
          <p className="py-8 text-center text-neutral-600 dark:text-neutral-400">
            No reviews yet.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {reviews.map((review) => (
              <li key={review.id} className="py-4">
                {/* User */}
                <div className="flex items-center gap-2">
                  <span className="font-medium">{review.user.name}</span>
                  {authStatus === "authed" &&
                    myReviews[0]?.id === review.id && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                        your review
                      </span>
                    )}
                </div>

                {/* Rating */}
                <div className="mt-1 flex items-center gap-2">
                  <RatingStars value={review.rating} size={14} />
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                    {review.comment}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {reviewPagination && (
          <Pagination
            currentPage={reviewPagination.currentPage}
            totalPages={reviewPagination.totalPages}
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}