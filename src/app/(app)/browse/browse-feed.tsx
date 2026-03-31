"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Compass,
  Star,
  Clock,
  SlidersHorizontal,
  Search,
  X,
} from "lucide-react";
import type { Post, PostCategory, Urgency } from "@/lib/types";

interface PostWithProfile extends Post {
  profiles: {
    name: string;
    rating_avg: number;
    avatar_url: string | null;
  };
}

interface BrowseFeedProps {
  posts: PostWithProfile[];
  userId: string;
}

const urgencyColors: Record<string, string> = {
  low: "bg-secondary/10 text-secondary",
  medium: "bg-star/10 text-star",
  high: "bg-accent/10 text-accent",
};

const ALL_CATEGORIES: PostCategory[] = [
  "plumbing",
  "electrical",
  "appliances",
  "heating",
  "general",
];

const ALL_URGENCIES: Urgency[] = ["low", "medium", "high"];

export function BrowseFeed({ posts, userId }: BrowseFeedProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "urgency">("newest");
  const [selectedCategories, setSelectedCategories] = useState<PostCategory[]>(
    []
  );
  const [selectedUrgencies, setSelectedUrgencies] = useState<Urgency[]>([]);

  const urgencyOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let result = posts.filter((post) => {
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(post.category as PostCategory)
      )
        return false;
      if (
        selectedUrgencies.length > 0 &&
        !selectedUrgencies.includes(post.urgency as Urgency)
      )
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !post.title.toLowerCase().includes(q) &&
          !post.description.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });

    if (sortBy === "urgency") {
      result = [...result].sort(
        (a, b) =>
          (urgencyOrder[a.urgency] ?? 2) - (urgencyOrder[b.urgency] ?? 2)
      );
    }

    return result;
  }, [posts, selectedCategories, selectedUrgencies, searchQuery, sortBy]);

  const currentPost = filteredPosts[currentIndex] as
    | PostWithProfile
    | undefined;

  const activeFilterCount =
    selectedCategories.length +
    selectedUrgencies.length +
    (searchQuery.trim() ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  function toggleCategory(cat: PostCategory) {
    setCurrentIndex(0);
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function toggleUrgency(urg: Urgency) {
    setCurrentIndex(0);
    setSelectedUrgencies((prev) =>
      prev.includes(urg) ? prev.filter((u) => u !== urg) : [...prev, urg]
    );
  }

  function clearFilters() {
    setCurrentIndex(0);
    setSelectedCategories([]);
    setSelectedUrgencies([]);
    setSearchQuery("");
    setSortBy("newest");
  }

  function handlePrev() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  function handleNext() {
    setCurrentIndex((i) => Math.min(filteredPosts.length - 1, i + 1));
  }

  function handleInterested() {
    if (currentPost) {
      router.push(`/posts/${currentPost.id}`);
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-secondary">
          {filteredPosts.length} problem{filteredPosts.length !== 1 ? "s" : ""}{" "}
          found
        </p>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            showFilters || activeFilterCount > 0
              ? "bg-secondary/10 text-secondary"
              : "text-text-secondary hover:bg-background"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full bg-secondary text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-primary">Filter Posts</h4>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-accent hover:underline"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setCurrentIndex(0);
                setSearchQuery(e.target.value);
              }}
              placeholder="Search posts..."
              className="w-full pl-9 pr-4 py-2.5 border border-divider rounded-lg text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {/* Sort */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">
              Sort by
            </p>
            <div className="flex gap-2">
              {(
                [
                  { key: "newest", label: "Newest" },
                  { key: "urgency", label: "Urgency" },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    setCurrentIndex(0);
                    setSortBy(key);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    sortBy === key
                      ? "border-secondary bg-secondary/10 text-secondary"
                      : "border-divider text-text-secondary hover:border-text-secondary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${
                    selectedCategories.includes(cat)
                      ? "border-secondary bg-secondary/10 text-secondary"
                      : "border-divider text-text-secondary hover:border-text-secondary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency filter */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">
              Urgency
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_URGENCIES.map((urg) => (
                <button
                  key={urg}
                  onClick={() => toggleUrgency(urg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${
                    selectedUrgencies.includes(urg)
                      ? urg === "high"
                        ? "border-accent bg-accent/10 text-accent"
                        : urg === "medium"
                          ? "border-star bg-star/10 text-star"
                          : "border-secondary bg-secondary/10 text-secondary"
                      : "border-divider text-text-secondary hover:border-text-secondary"
                  }`}
                >
                  {urg}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Post Card + Navigation */}
      {!currentPost ? (
        <div className="flex-1 flex items-center justify-center py-8">
          <Card className="text-center py-12 px-8 max-w-sm">
            <Compass className="w-12 h-12 text-divider mx-auto mb-4" />
            <h3 className="text-lg font-bold text-primary">
              No problems found
            </h3>
            <p className="text-sm text-text-secondary mt-2">
              {activeFilterCount > 0
                ? "Try adjusting your filters to see more results."
                : "No problems available right now. Check back soon!"}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-secondary font-medium hover:underline"
              >
                Clear filters
              </button>
            )}
          </Card>
        </div>
      ) : (
        <>
          {/* Card counter */}
          <p className="text-xs text-text-secondary text-center">
            {currentIndex + 1} of {filteredPosts.length}
          </p>

          {/* Navigation + Card layout */}
          <div className="flex items-center gap-3">
            {/* Left arrow */}
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-11 h-11 rounded-full border-2 border-divider flex items-center justify-center text-text-secondary hover:border-secondary hover:text-secondary transition-colors shrink-0 disabled:opacity-30 disabled:hover:border-divider disabled:hover:text-text-secondary"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Problem Card */}
            <Card padding={false} className="overflow-hidden flex-1 min-w-0">
              {/* Hero Image */}
              {currentPost.images?.[0] ? (
                <div className="h-48 relative">
                  <img
                    src={currentPost.images[0]}
                    alt={currentPost.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-primary text-[10px] font-bold uppercase rounded-md capitalize">
                      {currentPost.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md capitalize ${urgencyColors[currentPost.urgency]}`}
                    >
                      {currentPost.urgency}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-32 bg-background flex items-center justify-center relative">
                  <Compass className="w-8 h-8 text-divider" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-md capitalize">
                      {currentPost.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md capitalize ${urgencyColors[currentPost.urgency]}`}
                    >
                      {currentPost.urgency}
                    </span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold text-primary leading-tight line-clamp-2">
                  {currentPost.title}
                </h3>
                <p className="text-sm text-text-secondary line-clamp-3">
                  {currentPost.description}
                </p>

                {/* Seeker info */}
                <div className="flex items-center justify-between pt-3 border-t border-divider">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {(
                          currentPost.profiles?.name || "A"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">
                        {currentPost.profiles?.name || "Anonymous"}
                      </p>
                      {Number(currentPost.profiles?.rating_avg || 0) > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-star fill-star" />
                          <span className="text-[10px] text-text-secondary">
                            {Number(
                              currentPost.profiles?.rating_avg || 0
                            ).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-text-secondary">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px]">
                      {timeAgo(currentPost.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Right arrow */}
            <button
              onClick={handleNext}
              disabled={currentIndex === filteredPosts.length - 1}
              className="w-11 h-11 rounded-full border-2 border-divider flex items-center justify-center text-text-secondary hover:border-secondary hover:text-secondary transition-colors shrink-0 disabled:opacity-30 disabled:hover:border-divider disabled:hover:text-text-secondary"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Interested Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleInterested}
              className="h-14 px-8 rounded-full"
            >
              <Check className="w-5 h-5" />
              Interested
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
