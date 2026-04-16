from pathlib import Path

import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(page_title="SuperStore Streamlit Dashboard", layout="wide", initial_sidebar_state="expanded")

DATA_CANDIDATES = [
    Path("SuperStoreOrders_SuperStoreOrders.csv"),
    Path("src/frontend/public/SuperStoreOrders_SuperStoreOrders.csv"),
]

TAB_NAMES = [
    "Overview",
    "Profit Leakage Lab",
    "Category & Region Studio",
    "Trend Analysis",
    "Statistical Insights",
    "Predictions & Forecasts",
    "Storytelling & Takeaways",
    "Financial Strength Dashboard",
    "Customer & Product Focus",
    "Shipping Mode Analysis",
    "Data Grid View",
    "Feedback",
]


@st.cache_data
def load_data() -> pd.DataFrame:
    for path in DATA_CANDIDATES:
        if path.exists():
            df = pd.read_csv(path)
            df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")
            df["ship_date"] = pd.to_datetime(df["ship_date"], errors="coerce")
            df["year"] = pd.to_numeric(df.get("year"), errors="coerce")
            for col in ["sales", "profit", "discount", "quantity", "shipping_cost"]:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
            return df
    raise FileNotFoundError("Could not find SuperStoreOrders_SuperStoreOrders.csv")


def format_money(value: float) -> str:
    return f"${value:,.0f}"


def format_pct(value: float) -> str:
    return f"{value:.2%}"


def top_group_value(frame: pd.DataFrame, group_col: str, value_col: str, ascending: bool = False, default: str = "N/A") -> str:
    if frame.empty or group_col not in frame.columns or value_col not in frame.columns:
        return default
    grouped = frame.groupby(group_col)[value_col].sum().sort_values(ascending=ascending)
    return str(grouped.index[0]) if len(grouped) else default


def top_category_subcategory(frame: pd.DataFrame) -> str:
    if frame.empty:
        return "N/A"
    grouped = (
        frame.groupby(["category", "sub_category"])["profit"]
        .sum()
        .sort_values(ascending=False)
    )
    if grouped.empty:
        return "N/A"
    category, sub_category = grouped.index[0]
    return f"{category} / {sub_category}"


def monthly_summary(frame: pd.DataFrame) -> pd.DataFrame:
    if frame.empty:
        return pd.DataFrame(columns=["month", "sales", "profit"])
    return (
        frame.dropna(subset=["order_date"])
        .assign(month=lambda d: d["order_date"].dt.to_period("M").dt.to_timestamp())
        .groupby("month", as_index=False)[["sales", "profit"]]
        .sum()
    )


def build_forecast(frame: pd.DataFrame) -> pd.DataFrame:
    if len(frame) < 2:
        return frame.copy()
    x = np.arange(len(frame))
    y = frame["sales"].to_numpy(dtype=float)
    slope, intercept = np.polyfit(x, y, 1)
    forecast_rows = []
    last_month = pd.Timestamp(frame["month"].iloc[-1])
    for step in range(1, 7):
        month = last_month + pd.DateOffset(months=step)
        idx = len(frame) + step - 1
        forecast_rows.append({
            "month": month,
            "sales": np.nan,
            "profit": np.nan,
            "forecast": max(0.0, slope * idx + intercept),
        })
    history = frame.copy()
    history["forecast"] = np.nan
    return pd.concat([history, pd.DataFrame(forecast_rows)], ignore_index=True)


df = load_data()
min_date = df["order_date"].dropna().min().date()
max_date = df["order_date"].dropna().max().date()
default_range = (pd.Timestamp("2014-01-01").date(), pd.Timestamp("2014-12-31").date())

st.title("📊 SuperStore Sales Analytics")

with st.sidebar:
    st.header("Filters")
    date_range = st.date_input(
        "Order date range",
        value=default_range,
        min_value=min_date,
        max_value=max_date,
    )

    regions = sorted(df["region"].dropna().unique().tolist())
    categories = sorted(df["category"].dropna().unique().tolist())
    segments = sorted(df["segment"].dropna().unique().tolist())

    selected_regions = st.multiselect("Region", regions, default=regions)
    selected_categories = st.multiselect("Category", categories, default=categories)
    selected_segments = st.multiselect("Segment", segments, default=segments)

if isinstance(date_range, (list, tuple)) and len(date_range) == 2:
    start_date = pd.Timestamp(date_range[0])
    end_date = pd.Timestamp(date_range[1])
else:
    start_date = pd.Timestamp(default_range[0])
    end_date = pd.Timestamp(default_range[1])

filtered = df[
    (df["order_date"] >= start_date)
    & (df["order_date"] <= end_date)
    & df["region"].isin(selected_regions)
    & df["category"].isin(selected_categories)
    & df["segment"].isin(selected_segments)
].copy()

monthly = monthly_summary(filtered)
forecast = build_forecast(monthly)
category_profit = filtered.groupby("category", as_index=False)[["sales", "profit"]].sum().sort_values("profit", ascending=False)
region_profit = filtered.groupby("region", as_index=False)[["sales", "profit"]].sum().sort_values("profit", ascending=False)
ship_mode = filtered.groupby("ship_mode", as_index=False)[["sales", "profit", "shipping_cost"]].sum().sort_values("profit", ascending=False)
segment_profit = filtered.groupby("segment", as_index=False)[["sales", "profit"]].sum().sort_values("profit", ascending=False)
customer_profit = filtered.groupby("customer_name", as_index=False)[["sales", "profit"]].sum().sort_values("profit", ascending=False)
product_profit = filtered.groupby("product_name", as_index=False)[["sales", "profit"]].sum().sort_values("sales", ascending=False)
treemap_data = (
    filtered.groupby(["category", "sub_category"], as_index=False)[["sales", "profit"]]
    .sum()
)
treemap_data = treemap_data[treemap_data["sales"] > 0]

sales_total = float(filtered["sales"].sum())
profit_total = float(filtered["profit"].sum())
profit_margin = profit_total / sales_total if sales_total else 0.0
loss_orders = int((filtered["profit"] < 0).sum())
avg_discount = float(filtered["discount"].mean()) if len(filtered) else 0.0

metrics = {
    "Orders": f"{len(filtered):,}",
    "Total Sales": format_money(sales_total),
    "Total Profit": format_money(profit_total),
    "Profit Margin": format_pct(profit_margin),
    "Loss Orders": f"{loss_orders:,}",
    "Avg Discount": format_pct(avg_discount),
    "Top Performing Product": top_group_value(filtered, "product_name", "sales"),
    "Weak Performing Product": top_group_value(filtered, "product_name", "profit", ascending=True),
    "Target Customer Segment": top_group_value(filtered, "segment", "profit"),
    "Target Region": top_group_value(filtered, "region", "profit"),
    "Target Category/Sub-Category": top_category_subcategory(filtered),
}

primary_cols = st.columns(6)
for idx, key in enumerate(["Total Sales", "Total Profit", "Profit Margin", "Orders", "Loss Orders", "Avg Discount"]):
    primary_cols[idx].metric(key, metrics[key])

secondary_cols = st.columns(5)
for idx, key in enumerate([
    "Top Performing Product",
    "Weak Performing Product",
    "Target Customer Segment",
    "Target Region",
    "Target Category/Sub-Category",
]):
    secondary_cols[idx].metric(key, metrics[key])

tabs = st.tabs(TAB_NAMES)

with tabs[0]:
    left, right = st.columns(2)
    trend = px.line(monthly, x="month", y=["sales", "profit"], markers=True, title="Monthly Sales and Profit Trend")
    bar = px.bar(category_profit, x="category", y="profit", color="sales", title="Profit by Category")
    left.plotly_chart(trend, use_container_width=True)
    right.plotly_chart(bar, use_container_width=True)

    scatter = px.scatter(
        filtered,
        x="discount",
        y="profit",
        color="category",
        size="sales",
        hover_data=["product_name", "region", "segment"],
        title="Discount vs Profit",
    )
    st.plotly_chart(scatter, use_container_width=True)

with tabs[1]:
    st.subheader("Profit Leakage Lab")
    leak_scatter = px.scatter(
        filtered,
        x="discount",
        y="profit",
        color="sub_category",
        size="sales",
        title="Discount Pressure vs Profit Leakage",
    )
    hist = px.histogram(filtered, x="profit", nbins=30, color="category", title="Profit Distribution")
    col_a, col_b = st.columns(2)
    col_a.plotly_chart(leak_scatter, use_container_width=True)
    col_b.plotly_chart(hist, use_container_width=True)

with tabs[2]:
    st.subheader("Category & Region Studio")
    col_a, col_b = st.columns(2)
    col_a.plotly_chart(px.sunburst(filtered, path=["region", "category", "sub_category"], values="sales", title="Sales Composition"), use_container_width=True)
    treemap_fig = px.treemap(
        treemap_data,
        path=["category", "sub_category"],
        values="sales",
        color="profit",
        color_continuous_scale="RdYlGn",
        color_continuous_midpoint=0,
        hover_data={"sales": ":,.0f", "profit": ":,.0f"},
        title="Profit Tree Map",
    )
    col_b.plotly_chart(treemap_fig, use_container_width=True)

with tabs[3]:
    st.subheader("Trend Analysis")
    st.plotly_chart(px.line(monthly, x="month", y="sales", markers=True, title="Sales Trend"), use_container_width=True)
    st.plotly_chart(px.line(monthly, x="month", y="profit", markers=True, title="Profit Trend"), use_container_width=True)

with tabs[4]:
    st.subheader("Statistical Insights")
    col_a, col_b = st.columns(2)
    corr = filtered[["sales", "profit", "discount", "quantity", "shipping_cost"]].corr(numeric_only=True)
    col_a.plotly_chart(px.imshow(corr, text_auto=True, aspect="auto", title="Correlation Matrix"), use_container_width=True)
    col_b.plotly_chart(px.box(filtered, x="category", y="profit", color="category", title="Profit Spread by Category"), use_container_width=True)

with tabs[5]:
    st.subheader("Predictions & Forecasts")
    forecast_chart = px.line(forecast, x="month", y=["sales", "forecast"], markers=True, title="6-Month Sales Forecast")
    st.plotly_chart(forecast_chart, use_container_width=True)

with tabs[6]:
    st.subheader("Storytelling & Takeaways")
    st.markdown(
        f"""
        - **Strongest region:** `{metrics['Target Region']}`
        - **Best segment:** `{metrics['Target Customer Segment']}`
        - **Top product:** `{metrics['Top Performing Product']}`
        - **Main leakage risk:** `{metrics['Weak Performing Product']}`
        """
    )

with tabs[7]:
    st.subheader("Financial Strength Dashboard")
    col_a, col_b = st.columns(2)
    col_a.plotly_chart(px.bar(region_profit, x="region", y="profit", color="sales", title="Regional Profit Strength"), use_container_width=True)
    col_b.plotly_chart(px.bar(segment_profit, x="segment", y="profit", color="sales", title="Segment Profit Strength"), use_container_width=True)

with tabs[8]:
    st.subheader("Customer & Product Focus")
    col_a, col_b = st.columns(2)
    col_a.plotly_chart(px.bar(product_profit.head(10), x="sales", y="product_name", orientation="h", title="Top 10 Products by Sales"), use_container_width=True)
    col_b.plotly_chart(px.bar(customer_profit.head(10), x="profit", y="customer_name", orientation="h", title="Top 10 Customers by Profit"), use_container_width=True)

with tabs[9]:
    st.subheader("Shipping Mode Analysis")
    st.plotly_chart(px.bar(ship_mode, x="ship_mode", y=["sales", "profit", "shipping_cost"], barmode="group", title="Shipping Performance"), use_container_width=True)

with tabs[10]:
    st.subheader("Data Grid View")
    st.dataframe(
        filtered[
            [
                "order_id",
                "order_date",
                "region",
                "category",
                "sub_category",
                "product_name",
                "sales",
                "profit",
            ]
        ].head(500),
        use_container_width=True,
    )

with tabs[11]:
    st.subheader("Feedback")
