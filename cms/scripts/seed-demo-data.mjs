import { createClient } from "next-sanity";
import { getCliClient } from "sanity/cli";

const categories = [
  {
    title: "Home & Living",
    slug: "demo-home-living",
    description: "Thoughtful pieces for a calmer, more considered home.",
  },
  {
    title: "Kitchen & Dining",
    slug: "demo-kitchen-dining",
    description: "Everyday tools for slow mornings and shared meals.",
  },
  {
    title: "Accessories",
    slug: "demo-accessories",
    description: "Useful finishing touches for daily routines and travel.",
  },
  {
    title: "Everyday Essentials",
    slug: "demo-everyday-essentials",
    description: "Well-made staples for simple, repeatable rituals.",
  },
  {
    title: "Tech & Audio",
    slug: "demo-tech-audio",
    description: "Considered technology for listening, working, and unwinding.",
  },
  {
    title: "Apparel",
    slug: "demo-apparel",
    description: "Comfortable pieces designed to be worn often.",
  },
];

const products = [
  {
    name: "Sample — Arc Table Lamp",
    slug: "demo-arc-table-lamp",
    description: "A sculptural lamp with a warm glow for reading nooks and bedside tables.",
    price: 79,
    discount: 0,
    stock: 16,
    status: "hot",
    label: "Editor’s pick",
    category: "demo-home-living",
    image: "photo-1507473885765-e6ed057f782c",
  },
  {
    name: "Sample — Everyday Ceramic Mug",
    slug: "demo-everyday-ceramic-mug",
    description: "A tactile stoneware mug sized for a slow coffee or tea break.",
    price: 24,
    discount: 0,
    stock: 28,
    status: "new",
    label: "New arrival",
    category: "demo-kitchen-dining",
    image: "photo-1514228742587-6b1558fcca3d",
  },
  {
    name: "Sample — Canvas Market Tote",
    slug: "demo-canvas-market-tote",
    description: "A sturdy, lightweight carryall for market runs and everyday errands.",
    price: 32,
    discount: 0,
    stock: 40,
    status: "new",
    label: "Everyday carry",
    category: "demo-accessories",
    image: "photo-1590874103328-eac38a683ce7",
  },
  {
    name: "Sample — Everyday Water Bottle",
    slug: "demo-everyday-water-bottle",
    description: "A reusable bottle with a clean silhouette for desk, studio, and travel.",
    price: 28,
    discount: 15,
    stock: 8,
    status: "sale",
    label: "15% off",
    category: "demo-everyday-essentials",
    image: "photo-1602143407151-7111542de6e8",
  },
  {
    name: "Sample — Citrus Hand Wash",
    slug: "demo-citrus-hand-wash",
    description: "A gentle, bright hand wash for the small rituals between busy moments.",
    price: 18,
    discount: 0,
    stock: 50,
    status: "hot",
    label: "Daily ritual",
    category: "demo-everyday-essentials",
    image: "photo-1608571423902-eed4a5ad8108",
  },
  {
    name: "Sample — Studio Wireless Headphones",
    slug: "demo-studio-wireless-headphones",
    description: "Comfortable over-ear headphones for focused listening throughout the day.",
    price: 129,
    discount: 0,
    stock: 12,
    status: "hot",
    label: "Staff favorite",
    category: "demo-tech-audio",
    image: "photo-1505740420928-5e560c06d30e",
  },
  {
    name: "Sample — Relaxed Linen Shirt",
    slug: "demo-relaxed-linen-shirt",
    description: "An easy-fitting shirt in breathable linen for warm days and layered looks.",
    price: 46,
    discount: 10,
    stock: 5,
    status: "sale",
    label: "10% off",
    category: "demo-apparel",
    image: "photo-1598033129183-c4f50c736f10",
  },
  {
    name: "Sample — Travel Organizer Set",
    slug: "demo-travel-organizer-set",
    description: "A compact set of organizers that keeps the essentials easy to find.",
    price: 22,
    discount: 0,
    stock: 0,
    status: "new",
    label: "Back soon",
    category: "demo-accessories",
    image: "photo-1553062407-98eeb64c6a62",
  },
];

const isWriteMode = process.argv.includes("--write");

if (!isWriteMode) {
  console.log("Dry run only. Re-run with --write to add the sample catalog to Sanity.");
  console.log(`Would upsert ${categories.length} sample categories and ${products.length} sample products.`);
  process.exit(0);
}

const { NEXT_PUBLIC_SANITY_PROJECT_ID: projectId, NEXT_PUBLIC_SANITY_DATASET: dataset } =
  process.env;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-11-24";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset) {
  throw new Error(
    "Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET in cms/.env.local."
  );
}

const client = token
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token,
    })
  : getCliClient({ apiVersion }).withConfig({ projectId, dataset, useCdn: false });

async function findBySlug(type, slug) {
  return client.fetch(
    '*[_type == $type && slug.current == $slug][0]{_id, "imageAssetId": image.asset._ref}',
    { type, slug }
  );
}

async function upsertBySlug(type, slug, fields) {
  const existing = await findBySlug(type, slug);
  if (existing?._id) {
    await client.patch(existing._id).set(fields).commit();
    return existing._id;
  }

  const created = await client.create({ _type: type, ...fields });
  return created._id;
}

async function uploadProductImage(product) {
  const url = `https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=1200&q=85`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not download the sample image for ${product.name}: ${response.status}`);
  }

  const asset = await client.assets.upload("image", Buffer.from(await response.arrayBuffer()), {
    filename: `${product.slug}.jpg`,
    contentType: response.headers.get("content-type") || "image/jpeg",
  });

  return {
    _type: "image",
    alt: product.name,
    asset: { _type: "reference", _ref: asset._id },
  };
}

const categoryIds = new Map();
for (const category of categories) {
  const { slug, ...fields } = category;
  const id = await upsertBySlug("category", slug, {
    ...fields,
    slug: { _type: "slug", current: slug },
    isDemoContent: true,
  });
  categoryIds.set(slug, id);
}

for (const product of products) {
  const { slug, category, image: imageId, ...fields } = product;
  const existing = await findBySlug("product", slug);
  const productFields = {
    ...fields,
    slug: { _type: "slug", current: slug },
    categories: [
      {
        _type: "reference",
        _ref: categoryIds.get(category),
      },
    ],
    isDemoContent: true,
  };

  if (!existing?.imageAssetId) {
    productFields.image = await uploadProductImage({ ...product, image: imageId });
  }

  if (existing?._id) {
    await client.patch(existing._id).set(productFields).commit();
  } else {
    await client.create({ _type: "product", ...productFields });
  }
}

const counts = await client.fetch(
  `{
    "categories": count(*[_type == "category" && slug.current in $categorySlugs]),
    "products": count(*[_type == "product" && slug.current in $productSlugs]),
    "productsWithImages": count(*[_type == "product" && slug.current in $productSlugs && defined(image.asset._ref)])
  }`,
  {
    categorySlugs: categories.map(({ slug }) => slug),
    productSlugs: products.map(({ slug }) => slug),
  }
);

if (
  counts.categories !== categories.length ||
  counts.products !== products.length ||
  counts.productsWithImages !== products.length
) {
  throw new Error(`Seed verification failed: ${JSON.stringify(counts)}`);
}

console.log(
  `Verified ${counts.categories} sample categories, ${counts.products} sample products, and ${counts.productsWithImages} product images in ${projectId}/${dataset}. No unrelated documents were changed.`
);