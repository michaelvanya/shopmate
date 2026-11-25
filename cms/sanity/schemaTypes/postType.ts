import { DocumentTextIcon } from "@sanity/icons";
import { defineType, defineField } from "sanity";

export const postType = defineType({
  name: "post",
  title: "Article",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "story", title: "Story", default: true },
    { name: "publishing", title: "Publishing" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "story",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "story",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      type: "text",
      group: "story",
      description: "A short introduction for article cards and search previews.",
      validation: (Rule) => Rule.max(220),
    }),
    defineField({
      name: "body",
      type: "text",
      group: "story",
      description: "Write the article content in plain text.",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      group: "publishing",
      options: { hotspot: true },
    }),
    defineField({
      name: "publishedAt",
      title: "Publish Date",
      type: "datetime",
      group: "publishing",
      description: "The date shown to readers when this article is published.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "excerpt",
      media: "coverImage",
    },
  },
});