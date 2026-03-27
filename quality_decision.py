import pandas as pd

df = pd.read_csv('SuperStoreOrders_SuperStoreOrders_CLEANED.csv')

print("=" * 80)
print("DATA QUALITY DECISION POINT")
print("=" * 80)

# Rows with valid dates
valid_date_rows = df[df['order_date'].notna()]
null_date_rows = df[df['order_date'].isna()]

print(f"\nValid date rows: {len(valid_date_rows)} ({(len(valid_date_rows)/len(df)*100):.1f}%)")
print(f"NULL date rows (#VALUE! errors): {len(null_date_rows)} ({(len(null_date_rows)/len(df)*100):.1f}%)")

print(f"\n\nOPTION ANALYSIS:")
print(f"-" * 80)

print(f"\nOption 1: REMOVE rows with #VALUE! error dates")
print(f"  Impact: Keep only {len(valid_date_rows)} rows of {len(df)} ({(len(valid_date_rows)/len(df)*100):.1f}%)")
print(f"  Lost rows: {len(null_date_rows)}")
print(f"  Lost sales: ${valid_date_rows['sales'].sum()} out of ${df['sales'].sum()}")
print(f"  Lost profits: ${valid_date_rows['profit'].sum()} out of ${df['profit'].sum()}")

print(f"\nOption 2: KEEP all rows (analysis works without dates for some questions)")
print(f"  Benefit: No data loss")
print(f"  Risk: Date-based analysis impossible on 60% of data")

print(f"\n\nRECOMMENDATION:")
print(f"-" * 80)
print(f"Option 1 is BETTER because:")
print(f"  1. Excel formula errors = corrupted data, cannot trust reconstruction")
print(f"  2. 20,000+ rows with valid data is still substantial")
print(f"  3. Analysis quality > quantity (61% corrupted data is worse than none)")
print(f"  4. Transparent about data limitations")

# Check what columns ARE valid in null-date rows
print(f"\n\nCHECKING NULL-DATE ROWS FOR OTHER QUALITY ISSUES:")
print(f"-" * 80)
print(f"Rows with NULL dates - other data columns present?")
sample_null = null_date_rows.iloc[0]
print(f"\nSample null-date row:")
for col in ['order_id', 'customer_name', 'segment', 'sales', 'profit', 'category']:
    val = sample_null[col]
    print(f"  {col}: {val}")
    
print(f"\n\nColumns that are complete in null-date rows:")
for col in df.columns:
    if col not in ['order_date', 'ship_date', 'order_day', 'order_month', 'order_year', 'ship_day', 'ship_month', 'ship_year']:
        null_in_null_rows = null_date_rows[col].isna().sum()
        if null_in_null_rows == 0:
            print(f"  ✓ {col}: 100% complete")
