import pandas as pd

df = pd.read_csv('SuperStoreOrders_SuperStoreOrders.csv')
print('FINAL CLEAN DATASET')
print('=' * 80)
print(f'Records: {len(df):,}')
print(f'Columns: {len(df.columns)}')
print(f'Date Range: {df["order_date"].min()} to {df["order_date"].max()}')
print(f'Total Sales: {df["sales"].sum():,.0f}')
print(f'Total Profit: {df["profit"].sum():,.2f}')
