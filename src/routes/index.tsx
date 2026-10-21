import { createFileRoute, redirect } from "@tanstack/react-router";

// The seller app opens on Home, which is the sourcing screen.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meesho Sourcing — seller home (concept)" },
      {
        name: "description",
        content:
          "Seller home for the Meesho Sourcing concept: search raw materials, compare material prices and join open buying batches.",
      },
      { property: "og:title", content: "Meesho Sourcing — seller home (concept)" },
      {
        property: "og:description",
        content: "Explore pooled raw-material procurement for small Meesho sellers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/sourcing", replace: true });
  },
});
