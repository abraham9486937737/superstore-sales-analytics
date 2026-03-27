import pandas as pd

# Load cleaned data
df = pd.read_csv('SuperStoreOrders_SuperStoreOrders_CLEANED.csv')

print("=" * 80)
print("INVESTIGATING MISSING DATE VALUES")
print("=" * 80)

# Find rows with null dates
null_order_date = df[df['order_date'].isna()]
print(f"\nRows with NULL order_date: {len(null_order_date)}")
print(f"Sample of rows with NULL order_date:")
print(null_order_date[['order_id', 'customer_name', 'sales', 'order_day', 'order_month', 'order_year']].head(20))

# Check the order_day, order_month, order_year columns for these rows
print(f"\n\nOrder_day values for NULL order_date rows:")
print(null_order_date['order_day'].value_counts())

print(f"\nOrder_month values for NULL order_date rows:")
print(null_order_date['order_month'].value_counts())

print(f"\nOrder_year values for NULL order_date rows:")
print(null_order_date['order_year'].value_counts())

# Check if we can reconstruct the dates from components
print("\n" + "=" * 80)
print("Can we reconstruct dates from day/month/year components?")
print("=" * 80)

# Look at first valid date row
valid_dates = df[df['order_date'].notna()]
print(f"\nFirst row with valid order_date:")
row = valid_dates.iloc[0]
print(f"  order_date: {row['order_date']}")
print(f"  order_day: {row['order_day']}, order_month: {row['order_month']}, order_year: {row['order_year']}")

# Look at null date row with component values
null_with_components = df[(df['order_date'].isna()) & (df['order_month'] != '0')]
print(f"\nRows with NULL order_date but have month/day values: {len(null_with_components)}")
if len(null_with_components) > 0:
    print(f"Sample:")
    print(null_with_components[['order_id', 'order_date', 'order_day', 'order_month', 'order_year']].head(10))
    
    # Try to reconstruct
    print(f"\nAttempting reconstruction:")
    test_date = f"{null_with_components.iloc[0]['order_month']}/{null_with_components.iloc[0]['order_day']}/{null_with_components.iloc[0]['order_year']}"
    print(f"  {test_date}")
