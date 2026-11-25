import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const salesType = defineType({
  name: "sale",
  title: "Sale",
  type: "document",
  icon: TagIcon,
  groups: [
    { name: "offer", title: "Offer Details", default: true },
    { name: "schedule", title: "Schedule & Status" },
    { name: "creative", title: "Creative" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Sale Title",
      type: "string",
      group: "offer",
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: "description",
      title: "Sale Description",
      type: "text",
      group: "creative",
      description: "Explain the promotion in customer-friendly language.",
      validation: (Rule) => Rule.max(240),
    }),
    defineField({
      name: "badge",
      title: "Discount Badge",
      type: "string",
      group: "offer",
      description: "Discount Badge Ratio",
    }),
    defineField({
      name: "discountAmount",
      title: "Discount Amount",
      type: "number",
      group: "offer",
      description: "Amount off in percentage or fixed value",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "couponCode",
      title: "Coupon Code",
      type: "string",
      group: "offer",
      description: "The code customers enter at checkout, if the offer requires one.",
    }),
    defineField({
      name: "validFrom",
      title: "Valid From",
      type: "datetime",
      group: "schedule",
      validation: (Rule) =>
        Rule.custom((validFrom, context) => {
          const validUntil = context.document?.validUntil;
          if (
            typeof validFrom === "string" &&
            typeof validUntil === "string" &&
            Date.parse(validFrom) >= Date.parse(validUntil)
          ) {
            return "The promotion must end after it starts.";
          }
          return true;
        }),
    }),
    defineField({
      name: "validUntil",
      title: "Valid Until",
      type: "datetime",
      group: "schedule",
      validation: (Rule) =>
        Rule.custom((validUntil, context) => {
          const validFrom = context.document?.validFrom;
          if (
            typeof validFrom === "string" &&
            typeof validUntil === "string" &&
            Date.parse(validUntil) <= Date.parse(validFrom)
          ) {
            return "The promotion must end after it starts.";
          }
          return true;
        }),
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      group: "schedule",
      description: "Toggle to activate/deactivate the sale",
      initialValue: true,
    }),
    defineField({
      name: "image",
      title: "Product Image",
      type: "image",
      group: "creative",
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      discountAmount: "discountAmount",
      couponCode: "couponCode",
      isActive: "isActive",
    },
    prepare(select) {
      const { title, discountAmount, couponCode, isActive } = select;
      const status = isActive ? "Active" : "Paused";
      return {
        title,
        subtitle: `${discountAmount ?? "No discount"}% off · ${couponCode || "No code"} · ${status}`,
      };
    },
  },
});
