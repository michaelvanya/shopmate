import type { StructureResolver } from "sanity/structure";

const CURATED_TYPES = ["product", "category", "sale", "order", "post"];

export const structure: StructureResolver = (S) => {
  const now = new Date().toISOString();

  return S.list()
    .title("ShopMate Workspace")
    .items([
      S.listItem()
        .id("storefront")
        .title("Storefront")
        .child(
          S.list()
            .title("Storefront")
            .items([
              S.documentTypeListItem("product").title("All Products"),
              S.listItem()
                .id("featured-products")
                .title("Featured Products")
                .child(
                  S.documentTypeList("product")
                    .title("Featured Products")
                    .filter('_type == "product" && status == "hot"')
                ),
              S.listItem()
                .id("new-arrivals")
                .title("New Arrivals")
                .child(
                  S.documentTypeList("product")
                    .title("New Arrivals")
                    .filter('_type == "product" && status == "new"')
                ),
              S.listItem()
                .id("sale-products")
                .title("On Promotion")
                .child(
                  S.documentTypeList("product")
                    .title("On Promotion")
                    .filter('_type == "product" && status == "sale"')
                ),
              S.listItem()
                .id("low-stock-products")
                .title("Low Stock")
                .child(
                  S.documentTypeList("product")
                    .title("Low Stock")
                    .filter('_type == "product" && stock > 0 && stock <= 5')
                ),
              S.listItem()
                .id("sample-products")
                .title("Sample Products")
                .child(
                  S.documentTypeList("product")
                    .title("Sample Products")
                    .filter('_type == "product" && isDemoContent == true')
                ),
              S.divider(),
              S.documentTypeListItem("category").title("Categories"),
            ])
        ),

      S.divider(),

      S.listItem()
        .id("promotions")
        .title("Promotions")
        .child(
          S.list()
            .title("Promotions")
            .items([
              S.listItem()
                .id("active-promotions")
                .title("Active Promotions")
                .child(
                  S.documentTypeList("sale")
                    .title("Active Promotions")
                    .filter(
                      '_type == "sale" && isActive == true && (!defined(validFrom) || validFrom <= $now) && (!defined(validUntil) || validUntil >= $now)'
                    )
                    .params({ now })
                ),
              S.listItem()
                .id("scheduled-promotions")
                .title("Scheduled Promotions")
                .child(
                  S.documentTypeList("sale")
                    .title("Scheduled Promotions")
                    .filter('_type == "sale" && isActive == true && defined(validFrom) && validFrom > $now')
                    .params({ now })
                ),
              S.listItem()
                .id("expired-promotions")
                .title("Expired Promotions")
                .child(
                  S.documentTypeList("sale")
                    .title("Expired Promotions")
                    .filter('_type == "sale" && defined(validUntil) && validUntil < $now')
                    .params({ now })
                ),
              S.documentTypeListItem("sale").title("All Promotions"),
            ])
        ),

      S.divider(),

      S.listItem()
        .id("orders")
        .title("Orders & Fulfillment")
        .child(
          S.list()
            .title("Orders & Fulfillment")
            .items([
              S.listItem()
                .id("to-fulfill")
                .title("To Fulfill")
                .child(
                  S.documentTypeList("order")
                    .title("To Fulfill")
                    .filter('_type == "order" && status in ["pending", "paid"]')
                ),
              S.listItem()
                .id("in-transit")
                .title("In Transit")
                .child(
                  S.documentTypeList("order")
                    .title("In Transit")
                    .filter('_type == "order" && status == "shipped"')
                ),
              S.listItem()
                .id("completed-orders")
                .title("Completed")
                .child(
                  S.documentTypeList("order")
                    .title("Completed")
                    .filter('_type == "order" && status == "delivered"')
                ),
              S.listItem()
                .id("cancelled-orders")
                .title("Cancelled")
                .child(
                  S.documentTypeList("order")
                    .title("Cancelled")
                    .filter('_type == "order" && status == "cancelled"')
                ),
              S.documentTypeListItem("order").title("All Orders"),
            ])
        ),

      S.divider(),

      S.listItem()
        .id("editorial")
        .title("Editorial")
        .child(
          S.list()
            .title("Editorial")
            .items([S.documentTypeListItem("post").title("Articles")])
        ),

      S.divider(),

      ...S.documentTypeListItems().filter(
        (listItem) => !CURATED_TYPES.includes(listItem.getId() as string)
      ),
    ]);
};
