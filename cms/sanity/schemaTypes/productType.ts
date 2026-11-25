import { TrolleyIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Products",
  type: "document",
  icon: TrolleyIcon,
  groups: [
    { name: "details", title: "Product Details", default: true },
    { name: "merchandising", title: "Merchandising" },
    { name: "inventory", title: "Inventory" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      group: "details",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "details",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Product Image",
      type: "image",
      group: "details",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "string",
      group: "details",
      description: "A concise description shown on product cards and product pages.",
      validation: (Rule) => Rule.max(240),
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      group: "merchandising",
      description: "The current selling price in USD. For a sale item, enter the discounted price.",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "discount",
      title: "Discount Percentage",
      type: "number",
      group: "merchandising",
      description: "Percentage used to calculate the crossed-out original price. Use 0 when not on sale.",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      group: "details",
      description: "Choose the collections where customers should discover this product.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "category" }] })],
    }),
    defineField({
      name: "stock",
      title: "Stock",
      type: "number",
      group: "inventory",
      description: "Units available. Set to 0 to show the product as out of stock.",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      group: "merchandising",
      description: "Optional short badge displayed with the product price.",
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: "status",
      title: "Product Status",
      type: "string",
      group: "merchandising",
      description: "Controls the storefront badge and the curated Studio lists.",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Hot", value: "hot" },
          { title: "Sale", value: "sale" },
        ],
      },
    }),
    defineField({
      name: "isDemoContent",
      title: "Sample Content",
      type: "boolean",
      group: "details",
      description: "Identifies replaceable demonstration products in the Studio workspace.",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "image",
      price: "price",
      status: "status",
      stock: "stock",
      isDemoContent: "isDemoContent",
    },
    prepare(selection) {
      const price =
        typeof selection.price === "number" ? `$${selection.price.toFixed(2)}` : "Price not set";
      const details = [price, selection.status, selection.stock ?? "Stock not tracked"];

      if (selection.isDemoContent) details.push("Sample item");

      return {
        title: selection.title,
        subtitle: details.join(" · "),
        media: selection.media,
      };
    },
  },
});
