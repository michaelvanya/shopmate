import { BasketIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const orderType = defineType({
  name: "order",
  title: "Order",
  type: "document",
  icon: BasketIcon,
  groups: [
    { name: "summary", title: "Order Summary", default: true },
    { name: "customer", title: "Customer" },
    { name: "payment", title: "Payment" },
    { name: "items", title: "Items" },
    { name: "fulfillment", title: "Fulfillment" },
  ],
  fields: [
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      group: "summary",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "stripeCheckoutSessionId",
      title: "Stripe Checkout Session ID",
      type: "string",
      group: "payment",
      readOnly: true,
    }),
    defineField({
      name: "stripeCustomerId",
      title: "Stripe Customer ID",
      type: "string",
      group: "payment",
      readOnly: true,
      description: "Only present when Stripe creates a customer record for this checkout.",
    }),
    defineField({
      name: "clerkUserId",
      title: "Legacy Customer Account ID",
      type: "string",
      group: "customer",
      deprecated: {
        reason: "Customer accounts are no longer used. This is retained only on historical orders.",
      },
      readOnly: true,
      hidden: ({ value }) => value === undefined,
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
      group: "customer",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Customer Email",
      type: "string",
      group: "customer",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "stripePaymentIntentId",
      title: "Stripe Payment Intent ID",
      type: "string",
      group: "payment",
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "products",
      title: "Products",
      type: "array",
      group: "items",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "product",
              title: "Product Bought",
              type: "reference",
              to: [{ type: "product" }],
            }),
            defineField({
              name: "quantity",
              title: "Quantity Purchased",
              type: "number",
            }),
          ],
          preview: {
            select: {
              product: "product.name",
              quantity: "quantity",
              image: "product.image",
              price: "product.price",
              currency: "product.currency",
            },
            prepare(select) {
              return {
                title: `${select.product} x ${select.quantity}`,
                subtitle: `${select.price * select.quantity}`,
                media: select.image,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "totalPrice",
      title: "Total Price",
      type: "number",
      group: "payment",
      readOnly: true,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      group: "payment",
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "amountDiscount",
      title: "Amount Discount",
      type: "number",
      group: "payment",
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Order Status",
      type: "string",
      group: "fulfillment",
      description: "Update this status as the order is packed, shipped, or completed.",
      options: {
        list: [
          {
            title: "Pending",
            value: "pending",
          },
          {
            title: "Paid",
            value: "paid",
          },
          {
            title: "Shipped",
            value: "shipped",
          },
          {
            title: "Delivered",
            value: "delivered",
          },
          {
            title: "Cancelled",
            value: "cancelled",
          },
        ],
      },
    }),
    defineField({
      name: "orderDate",
      title: "Order Date",
      type: "datetime",
      group: "summary",
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      name: "customerName",
      amount: "totalPrice",
      currency: "currency",
      orderId: "orderNumber",
      email: "email",
      status: "status",
    },
    prepare(select) {
      const orderId = select.orderId || "Order number pending";
      const orderIdSnippet =
        orderId.length > 12 ? `${orderId.slice(0, 5)}...${orderId.slice(-5)}` : orderId;
      return {
        title: `${select.name || "Customer"} (${orderIdSnippet})`,
        subtitle: `${select.amount ?? "Amount pending"} ${select.currency || "USD"} · ${select.email || "Email pending"} · ${select.status || "pending"}`,
        media: BasketIcon,
      };
    },
  },
});
