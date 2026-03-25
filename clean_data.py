import pandas as pd
import numpy as np
from datetime import datetime
import re

print("=" * 80)
print("SUPERSTORE DATA CLEANING - COMPREHENSIVE AUDIT & FIX")
print("=" * 80)

# Step 1: Load and inspect
print("\n[STEP 1] Loading raw CSV...")
df_raw = pd.read_csv('SuperStoreOrders_SuperStoreOrders.csv', low_memory=False)
print(f"Raw shape: {df_raw.shape}")
print(f"Total rows: {len(df_raw)}")

# Step 2: Keep only valid rows (51,290)
print("\n[STEP 2] Removing empty rows (>51289)...")
df = df_raw[df_raw['order_id'].notna()].copy()
print(f"After removing NaN order_id: {df.shape[0]} rows")

# Step 3: Drop summary statistics columns
print("\n[STEP 3] Removing summary statistics columns...")
cols_to_drop = ['Unnamed: 29', 'Unnamed: 30', 'Unnamed: 31']
df = df.drop(columns=cols_to_drop, errors='ignore')
print(f"Dropped: {cols_to_drop}")
print(f"Shape after drop: {df.shape}")

# Step 4: Fix problematic columns
print("\n[STEP 4] Cleaning problematic columns...")

# Rename 'S_no' to something meaningful (appears to be a sequence number)
df = df.rename(columns={'S_no': 'sequence_number'})

# Fix 'order_date_vs_ship_date' - seems to be a label, check content
print(f"  - order_date_vs_ship_date unique values: {df['order_date_vs_ship_date'].unique()[:5]}")

# Step 5: Convert numeric columns
print("\n[STEP 5] Converting numeric columns...")
numeric_cols = ['sales', 'quantity', 'discount', 'profit', 'shipping_cost']
for col in numeric_cols:
    if col in df.columns:
        # Remove currency symbols and convert
        if df[col].dtype == 'object':
            df[col] = df[col].astype(str).str.replace('[\\$,]', '', regex=True)
        df[col] = pd.to_numeric(df[col], errors='coerce')
        print(f"  - {col}: converted, {df[col].isna().sum()} NaN values")

# Step 6: Fix date columns
print("\n[STEP 6] Fixing date columns...")
date_cols = ['order_date', 'ship_date']
for col in date_cols:
    if col in df.columns:
        try:
            df[col] = pd.to_datetime(df[col], format='%m/%d/%Y', errors='coerce')
            print(f"  - {col}: converted to datetime, {df[col].isna().sum()} NaN values")
        except Exception as e:
            print(f"  - {col}: error: {e}")

# Step 7: Drop redundant date component columns (we keep the main date columns)
print("\n[STEP 7] Evaluating redundant columns...")
redundant_cols = ['order_day', 'order_month', 'order_year', 'ship_day', 'ship_month', 'ship_year']
print(f"  - Keeping date component columns for now (can derive from datetime)")
print(f"  - These will be recreated from order_date and ship_date if needed")

# Step 8: Final column order and cleanup
print("\n[STEP 8] Organizing columns...")
core_cols = ['order_id', 'order_date', 'ship_date', 'ship_mode', 'customer_name', 
             'segment', 'country', 'state', 'market', 'region',
             'product_id', 'product_name', 'category', 'sub_category',
             'sales', 'quantity', 'discount', 'profit', 'shipping_cost',
             'order_priority', 'year']
optional_cols = [col for col in df.columns if col not in core_cols and col != 'order_date_vs_ship_date']
final_col_order = core_cols + optional_cols

df = df[[col for col in final_col_order if col in df.columns]]
print(f"Final columns: {df.columns.tolist()}")

# Step 9: Data quality report
print("\n[STEP 9] DATA QUALITY REPORT")
print("-" * 80)
print(f"Total rows: {len(df)}")
print(f"Total columns: {len(df.columns)}")
print(f"\nNull values per column:")
null_counts = df.isnull().sum()
for col in null_counts[null_counts > 0].sort_values(ascending=False).index:
    null_pct = (null_counts[col] / len(df)) * 100
    print(f"  {col}: {null_counts[col]} ({null_pct:.2f}%)")

print(f"\nData types:")
print(df.dtypes)

print(f"\nBasic statistics:")
print(df[['sales', 'quantity', 'discount', 'profit', 'shipping_cost']].describe())

# Step 10: Save cleaned data
print("\n[STEP 10] Saving cleaned CSV...")
cleaned_file = 'SuperStoreOrders_SuperStoreOrders_CLEANED.csv'
df.to_csv(cleaned_file, index=False)
print(f"✓ Saved: {cleaned_file}")
print(f"  Shape: {df.shape}")
print(f"  Records: {len(df)}")

# Also backup the original processed version
backup_file = 'SuperStoreOrders_SuperStoreOrders_RAW_BACKUP.csv'
df_raw.to_csv(backup_file, index=False)
print(f"✓ Backup: {backup_file}")

print("\n" + "=" * 80)
print("DATA CLEANING COMPLETE")
print("=" * 80)
