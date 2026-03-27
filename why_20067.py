import pandas as pd

raw = pd.read_csv("SuperStoreOrders_SuperStoreOrders_RAW_BACKUP.csv", low_memory=False)

# Keep only rows that have a real order_id (this is the true 51,290-record slice)
base = raw[raw["order_id"].notna()].copy()

# Count duplicates on business columns (ignoring helper/unnamed cols)
biz_cols = [
    "order_id", "order_date", "ship_date", "ship_mode", "customer_name", "segment",
    "state", "country", "market", "region", "product_id", "category", "sub_category",
    "product_name", "sales", "quantity", "discount", "profit", "shipping_cost",
    "order_priority", "year"
]
biz_cols = [c for c in biz_cols if c in base.columns]
dup_count = base.duplicated(subset=biz_cols).sum()

# #VALUE! corruption check in date components
value_err_order = (base["order_day"].astype(str) == "#VALUE!").sum() if "order_day" in base.columns else 0
value_err_ship = (base["ship_day"].astype(str) == "#VALUE!").sum() if "ship_day" in base.columns else 0

# Date parse health
order_dt = pd.to_datetime(base["order_date"], errors="coerce") if "order_date" in base.columns else pd.Series(dtype="datetime64[ns]")
ship_dt = pd.to_datetime(base["ship_date"], errors="coerce") if "ship_date" in base.columns else pd.Series(dtype="datetime64[ns]")

order_valid = order_dt.notna().sum()
order_invalid = order_dt.isna().sum()
ship_valid = ship_dt.notna().sum()
ship_invalid = ship_dt.isna().sum()

print("Base rows (non-null order_id):", len(base))
print("Duplicate rows on business fields:", int(dup_count))
print("Rows with #VALUE! in order_day:", int(value_err_order))
print("Rows with #VALUE! in ship_day:", int(value_err_ship))
print("Valid parsed order_date rows:", int(order_valid))
print("Invalid parsed order_date rows:", int(order_invalid))
print("Valid parsed ship_date rows:", int(ship_valid))
print("Invalid parsed ship_date rows:", int(ship_invalid))

print("\nReason clean file became 20,067 rows:")
print("20,067 = rows with valid order_date after parsing")
print("Dropped due to invalid order_date:", int(order_invalid))
