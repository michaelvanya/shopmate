import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const categoryType = defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: TagIcon,
  groups: [
    { name: "identity", title: "Collection Details", default: true },
    { name: "editorial", title: "Storefront Story" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Category Name",
      type: "string",
      group: "identity",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "identity",
      options: {
        source: "title",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      group: "editorial",
      description: "Explain what customers will find in this collection.",
      validation: (Rule) => Rule.max(240),
    }),
    defineField({
      name: "isDemoContent",
      title: "Sample Content",
      type: "boolean",
      group: "identity",
      description: "Marks a sample category that can be replaced before launch.",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
    },
  },
});
