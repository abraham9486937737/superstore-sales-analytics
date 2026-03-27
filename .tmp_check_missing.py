from pathlib import Path
import pandas as pd

candidate_paths = [
    Path('SuperStoreOrders_SuperStoreOrders.csv'),
    Path('../SuperStoreOrders_SuperStoreOrders.csv'),
    Path('data/raw/SuperStoreOrders_SuperStoreOrders.csv')
]

data_path = None
for p in candidate_paths:
    if p.exists():
        data_path = p
        break

print('Using file:', data_path)
raw_df = pd.read_csv(data_path)
print('Raw shape:', raw_df.shape)

# mimic notebook standardization
df = raw_df.copy()
df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]
drop_unnamed = [c for c in df.columns if c.startswith('unnamed') or c == '']
if drop_unnamed:
    df = df.drop(columns=drop_unnamed)

print('Standardized shape:', df.shape)
print('Columns sample:', df.columns[:20].tolist())

nulls = df.isna().sum().sort_values(ascending=False)
print('\nTop 15 missing-value columns:')
print(nulls.head(15).to_string())

for col in ['order_id', 'order id']:
    if col in df.columns:
        print(f"\n{col} missing:", int(df[col].isna().sum()), 'out of', len(df))
        print(f"{col} non-null sample:")
        print(df[col].dropna().head(5).to_string(index=False))
