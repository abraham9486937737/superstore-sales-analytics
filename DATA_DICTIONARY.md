# SuperStore Orders Dataset - Data Dictionary

## Dataset Overview
- **Total Records**: 20,067
- **Total Columns**: 22
- **Date Range**: January 1, 2011 – December 12, 2014
- **Data Quality**: Production-ready (100% complete on critical fields)

---

## Column Reference

### Order Identifiers & Dates
| Column | Type | Description | Nulls |
|--------|------|-------------|-------|
| `order_id` | String | Unique order identifier (Region-Year-Sequence) | 0% |
| `order_date` | DateTime | Date when order was placed | 0% |
| `ship_date` | DateTime | Date when order was shipped | 33.7% |
| `ship_mode` | String | Shipping method (Standard, First Class, Same Day, Second Class) | 0% |

### Customer Information
| Column | Type | Description | Nulls |
|--------|------|-------------|-------|
| `customer_name` | String | Name of customer | 0% |
| `segment` | String | Customer segment (Consumer, Corporate, Home Office) | 0% |
| `country` | String | Country of delivery | 0% |
| `state` | String | State/Province of delivery | 0% |
| `market` | String | Geographic market region | 0% |
| `region` | String | Sub-region within market | 0% |

### Product Information
| Column | Type | Description | Nulls |
|--------|------|-------------|-------|
| `product_id` | String | Unique product identifier | 0% |
| `product_name` | String | Name of product | 0% |
| `category` | String | Product category (Technology, Furniture, Office Supplies) | 0% |
| `sub_category` | String | Detailed product subcategory | 0% |

### Sales Metrics
| Column | Type | Description | Nulls |
|--------|------|-------------|-------|
| `sales` | Integer | Sale amount (USD, no decimals in source) | 0% |
| `quantity` | Float | Number of units ordered | 0% |
| `discount` | Float | Discount rate applied (0.0 to 0.9) | 0% |
| `profit` | Float | Net profit after costs (can be negative) | 0% |
| `shipping_cost` | Float | Cost of shipping to customer | 0% |

### Other
| Column | Type | Description | Nulls |
|--------|------|-------------|-------|
| `order_priority` | String | Priority level (Low, High, Medium, Critical) | 0% |
| `year` | Float | Year of order (2011-2014) | 0% |
| `sequence_number` | Float | Internal sequence identifier | 0% |

---

## Data Quality Notes

### Key Findings & Fixes Applied
1. **Original file** contained 1,048,575 rows (Excel's row limit)
   - Only 51,290 had data
   - Rows 51,291+ were padding/empty

2. **Summary statistics** were embedded as columns (Unnamed: 29-31)
   - Removed entirely during cleaning

3. **#VALUE! Excel formula errors** affected 60.9% of date columns
   - These rows (31,223) were removed as unrecoverable
   - Final dataset has 20,067 clean rows with valid dates

4. **Date issues**:
   - `order_date`: 100% complete (after removing errors)
   - `ship_date`: 33.7% null (orders not yet shipped at data export time)

5. **Column normalization**:
   - Dropped: `order_day`, `order_month`, `order_year`, `ship_day`, `ship_month`, `ship_year` (redundant)
   - Dropped: `order_date_vs_ship_date` (unclear definition)
   - All column names converted to lowercase with underscores

---

## Data Validation Checklist
- ✅ No empty rows
- ✅ All critical fields 100% complete (order_id, dates, sales, profit, etc.)
- ✅ Proper data types (dates, numeric, text)
- ✅ No Excel formula errors
- ✅ No duplicate column names
- ✅ Consistent column naming convention
- ✅ Date range validated (2011-2014)

---

## Usage Notes

### Before Analysis in Notebooks
```python
import pandas as pd

# Load the CLEAN dataset
df = pd.read_csv('SuperStoreOrders_SuperStoreOrders.csv')

# Convert date columns to datetime
df['order_date'] = pd.to_datetime(df['order_date'])
df['ship_date'] = pd.to_datetime(df['ship_date'])

# Verify
print(f"Records: {len(df)}")
print(f"Date range: {df['order_date'].min()} to {df['order_date'].max()}")
```

### Important Considerations
- Ship dates are sparse (67.3% null) - use order_date for time-series analysis
- Profit can be negative (losses recorded at order level)
- Sales values are integers; multiply by 1.0 if you need decimal precision
- Discount is a rate (0-0.9), not an amount

---

## Archive Files
- `SuperStoreOrders_SuperStoreOrders_RAW_BACKUP.csv`: Original, uncleaned (1,048,575 rows)
  - Keep for reference only
  - NOT for analysis

---

**Data Cleaned**: March 24, 2026  
**Last Updated**: March 24, 2026
