import pandas as pd

RAW_FILE = 'SuperStoreOrders_SuperStoreOrders_RAW_BACKUP.csv'
OUT_FILE = 'SuperStoreOrders_SuperStoreOrders.csv'

raw = pd.read_csv(RAW_FILE, low_memory=False)

# Keep only real records.
df = raw[raw['order_id'].notna()].copy()

# Remove summary/stat columns introduced by spreadsheet export.
df = df.drop(columns=['Unnamed: 29', 'Unnamed: 30', 'Unnamed: 31'], errors='ignore')

# Rename unclear column names.
df = df.rename(columns={'S_no': 'sequence_number'})

# Robust mixed-format date parsing: first default parser, then dayfirst fallback.
for col in ['order_date', 'ship_date']:
    s = df[col].astype(str)
    parsed_default = pd.to_datetime(s, errors='coerce')
    parsed_dayfirst = pd.to_datetime(s, errors='coerce', dayfirst=True)
    df[col] = parsed_default.fillna(parsed_dayfirst)

# Convert numeric fields.
for col in ['sales', 'quantity', 'discount', 'profit', 'shipping_cost', 'year', 'sequence_number']:
    if col in df.columns:
        if df[col].dtype == 'object':
            df[col] = df[col].astype(str).str.replace(',', '', regex=False).str.replace('$', '', regex=False)
        df[col] = pd.to_numeric(df[col], errors='coerce')

# Drop redundant split date component columns and unclear helper field.
df = df.drop(columns=['order_day', 'order_month', 'order_year', 'ship_day', 'ship_month', 'ship_year', 'order_date_vs_ship_date'], errors='ignore')

# Standardize column names.
df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]

# Reorder to a consistent schema.
final_columns = [
    'order_id', 'order_date', 'ship_date', 'ship_mode',
    'customer_name', 'segment', 'country', 'state', 'market', 'region',
    'product_id', 'product_name', 'category', 'sub_category',
    'sales', 'quantity', 'discount', 'profit', 'shipping_cost',
    'order_priority', 'year', 'sequence_number'
]
df = df[[c for c in final_columns if c in df.columns]]

# Save cleaned data.
df.to_csv(OUT_FILE, index=False)

# Validation summary.
print('rows:', len(df))
print('cols:', len(df.columns))
print('duplicates_on_full_row:', int(df.duplicated().sum()))
print('order_date_nulls:', int(df['order_date'].isna().sum()))
print('ship_date_nulls:', int(df['ship_date'].isna().sum()))
print('date_range:', df['order_date'].min(), 'to', df['order_date'].max())
print('sales_sum:', float(df['sales'].sum()))
print('profit_sum:', float(df['profit'].sum()))
