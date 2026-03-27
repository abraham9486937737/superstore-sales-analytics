import pandas as pd
import numpy as np

df = pd.read_csv('SuperStoreOrders_SuperStoreOrders.csv', low_memory=False)

print(f'Total rows read: {len(df)}')
print(f'\nRow 51289: {df.iloc[51289][["order_id", "sales", "profit"]].to_dict()}')
print(f'Row 51290: {df.iloc[51290][["order_id", "sales", "profit"]].to_dict()}')
print(f'Row 51291: {df.iloc[51291][["order_id", "sales", "profit"]].to_dict()}')

# Find the actual last row with data
last_valid = df[df['order_id'].notna()].index.max()
print(f'\nLast valid row with order_id: {last_valid}')

if last_valid is not None and last_valid < len(df):
    print(f'Row {last_valid}: {df.iloc[last_valid][["order_id", "sales", "profit"]].to_dict()}')
    if last_valid + 1 < len(df):
        print(f'Row {last_valid+1}: {df.iloc[last_valid+1][["order_id", "sales", "profit"]].to_dict()}')

# Count truly valid rows (non-null order_id)
valid_count = df['order_id'].notna().sum()
print(f'\nRows with valid order_id: {valid_count}')

# Check column names and structure
print(f'\nColumn names:')
print(df.columns.tolist())

print(f'\nUnnamed column contents (first 5):')
print(df[['Unnamed: 29', 'Unnamed: 30', 'Unnamed: 31']].head())
