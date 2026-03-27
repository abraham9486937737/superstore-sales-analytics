import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st
from pathlib import Path


st.set_page_config(
    page_title="SuperStore Command Center",
    page_icon="📈",
    layout="wide",
)


BAR_PALETTE = [
    "#0B4F6C",
    "#01BAEF",
    "#20BF55",
    "#F3A712",
    "#E4572E",
    "#7B2CBF",
    "#2EC4B6",
    "#FF006E",
    "#8338EC",
    "#3A86FF",
    "#FB5607",
    "#4361EE",
    "#5F0F40",
    "#9A031E",
    "#0F4C5C",
]


def inject_global_styles() -> None:
    st.markdown(
        """
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

            :root {
                --ink: #0a0f1f;
                --muted: #4b5565;
                --card: rgba(255,255,255,0.85);
                --stroke: rgba(12, 20, 38, 0.08);
            }

            html, body, [class*="css"] {
                font-family: 'IBM Plex Sans', sans-serif;
            }

            .stApp {
                background:
                    radial-gradient(circle at 10% 10%, rgba(1, 186, 239, 0.18), transparent 28%),
                    radial-gradient(circle at 86% 18%, rgba(255, 0, 110, 0.14), transparent 26%),
                    radial-gradient(circle at 70% 85%, rgba(32, 191, 85, 0.14), transparent 28%),
                    linear-gradient(135deg, #f8fbff 0%, #eef3ff 40%, #f9f6ff 100%);
            }

            .dashboard-title {
                font-family: 'Space Grotesk', sans-serif;
                font-weight: 700;
                font-size: 2.0rem;
                line-height: 1.2;
                color: var(--ink);
                margin-bottom: 0.2rem;
            }

            .dashboard-subtitle {
                color: var(--muted);
                font-size: 0.98rem;
                margin-bottom: 1rem;
            }

            .kpi-card {
                background: linear-gradient(160deg, rgba(255,255,255,0.95), rgba(246, 250, 255, 0.9));
                border: 1px solid var(--stroke);
                border-radius: 16px;
                padding: 14px 16px;
                box-shadow: 0 10px 30px rgba(26, 36, 65, 0.07);
                min-height: 110px;
            }

            .kpi-label {
                font-size: 0.78rem;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                color: #6b7280;
                margin-bottom: 0.45rem;
            }

            .kpi-value {
                font-family: 'Space Grotesk', sans-serif;
                font-weight: 700;
                font-size: 1.45rem;
                color: #111827;
                margin-bottom: 0.35rem;
            }

            .kpi-delta {
                font-size: 0.82rem;
                color: #374151;
                opacity: 0.92;
            }

            .menu-card {
                background: var(--card);
                border: 1px solid var(--stroke);
                border-radius: 14px;
                padding: 12px 14px;
                margin-bottom: 0.8rem;
                box-shadow: 0 6px 18px rgba(26, 36, 65, 0.05);
            }

            [data-testid="stSidebar"] {
                background: linear-gradient(180deg, #f7fbff 0%, #f4f2ff 100%);
                border-right: 1px solid rgba(13, 23, 44, 0.08);
            }

            [data-testid="stSidebar"] [data-testid="stMarkdownContainer"] h2 {
                font-family: 'Space Grotesk', sans-serif;
                letter-spacing: 0.02em;
            }

            .stTabs [role="tablist"] {
                gap: 0.45rem;
            }

            .stTabs [role="tab"] {
                border-radius: 999px;
                padding: 0.35rem 0.9rem;
                border: 1px solid rgba(15, 23, 42, 0.14);
                background: rgba(255,255,255,0.7);
            }

            .stTabs [aria-selected="true"] {
                background: linear-gradient(135deg, #0b4f6c, #3a86ff) !important;
                color: white !important;
                border-color: transparent !important;
            }

            .footer-section {
                background: linear-gradient(135deg, rgba(11, 79, 108, 0.08), rgba(58, 134, 255, 0.08));
                border-top: 1px solid rgba(12, 20, 38, 0.08);
                padding: 2rem 1rem 1.5rem;
                margin-top: 3rem;
                text-align: center;
                font-size: 0.85rem;
                color: #6b7280;
            }

            .footer-credit {
                font-family: 'Space Grotesk', sans-serif;
                font-weight: 600;
                color: #0B4F6C;
                margin-top: 0.5rem;
            }
        </style>
        """,
        unsafe_allow_html=True,
    )


def first_existing(df: pd.DataFrame, candidates: list[str]) -> str | None:
    for col in candidates:
        if col in df.columns:
            return col
    return None


def parse_mixed_date(series: pd.Series) -> pd.Series:
    # First pass: default parser. Second pass: day-first fallback for mixed exports.
    p1 = pd.to_datetime(series, errors="coerce")
    p2 = pd.to_datetime(series, errors="coerce", dayfirst=True)
    return p1.fillna(p2)


@st.cache_data(show_spinner=False)
def load_and_prepare_data() -> tuple[pd.DataFrame, dict[str, str | None]]:
    candidate_paths = [
        Path("SuperStoreOrders_SuperStoreOrders.csv"),
        Path("data/raw/SuperStoreOrders_SuperStoreOrders.csv"),
        Path("./SuperStoreOrders_SuperStoreOrders.csv"),
    ]

    data_path = None
    for path in candidate_paths:
        if path.exists():
            data_path = path
            break

    if data_path is None:
        raise FileNotFoundError(
            "Dataset not found. Place SuperStoreOrders_SuperStoreOrders.csv in project root or data/raw/."
        )

    df = pd.read_csv(data_path)
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    drop_unnamed = [c for c in df.columns if c.startswith("unnamed") or c == ""]
    if drop_unnamed:
        df = df.drop(columns=drop_unnamed)
    if "order_id" in df.columns:
        df = df[df["order_id"].notna()].copy()

    schema = {
        "order_date": first_existing(df, ["order_date", "orderdate", "date"]),
        "ship_date": first_existing(df, ["ship_date", "shipdate"]),
        "sales": first_existing(df, ["sales", "revenue"]),
        "profit": first_existing(df, ["profit", "profits"]),
        "discount": first_existing(df, ["discount", "disc"]),
        "category": first_existing(df, ["category"]),
        "sub_category": first_existing(df, ["sub_category", "subcategory", "sub-category"]),
        "segment": first_existing(df, ["segment"]),
        "region": first_existing(df, ["region"]),
        "state": first_existing(df, ["state", "province"]),
        "product_name": first_existing(df, ["product_name", "product"]),
    }

    for key in ["order_date", "ship_date"]:
        col = schema[key]
        if col is not None:
            df[col] = parse_mixed_date(df[col])

    for key in ["sales", "profit", "discount"]:
        col = schema[key]
        if col is not None:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    order_date_col = schema["order_date"]
    sales_col = schema["sales"]
    profit_col = schema["profit"]
    discount_col = schema["discount"]
    ship_date_col = schema["ship_date"]

    if order_date_col is not None:
        df["order_year"] = df[order_date_col].dt.year
        df["order_month"] = df[order_date_col].dt.month
        df["order_quarter"] = df[order_date_col].dt.quarter

    if sales_col is not None and profit_col is not None:
        df["profit_margin"] = np.where(df[sales_col] != 0, df[profit_col] / df[sales_col], np.nan)
        df["loss_flag"] = (df[profit_col] < 0).astype(int)

    if order_date_col is not None and ship_date_col is not None:
        df["shipping_delay_days"] = (df[ship_date_col] - df[order_date_col]).dt.days

    if discount_col is not None:
        bins = [-0.01, 0, 0.1, 0.2, 0.4, 1.0]
        labels = ["No Discount", "Low (0-10%)", "Medium (10-20%)", "High (20-40%)", "Very High (40%+)"]
        df["discount_bucket"] = pd.cut(df[discount_col], bins=bins, labels=labels)

    return df, schema


def format_money(x: float) -> str:
    return f"${x:,.0f}"


def render_kpi_card(label: str, value: str, delta_text: str) -> None:
    st.markdown(
        f"""
        <div class="kpi-card">
            <div class="kpi-label">{label}</div>
            <div class="kpi-value">{value}</div>
            <div class="kpi-delta">{delta_text}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def style_figure(fig):
    fig.update_layout(
        template="plotly_white",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(255,255,255,0.94)",
        font=dict(family="IBM Plex Sans", color="#1f2937", size=13),
        title_font=dict(family="Space Grotesk", size=18, color="#0f172a"),
        legend_title_text="",
        margin=dict(l=10, r=10, t=50, b=10),
    )
    fig.update_xaxes(showgrid=False, zeroline=False)
    fig.update_yaxes(showgrid=True, gridcolor="rgba(15, 23, 42, 0.08)", zeroline=False)
    return fig


def apply_filters(df: pd.DataFrame, schema: dict[str, str | None]) -> tuple[pd.DataFrame, dict[str, float]]:
    filtered = df.copy()

    st.sidebar.markdown("## Filter Studio")
    st.sidebar.markdown("Use multi-select, range sliders, and quick presets for faster exploration.")

    with st.sidebar.expander("Date Controls", expanded=True):
        order_date_col = schema["order_date"]
        date_coverage = 1.0
        if order_date_col is not None and filtered[order_date_col].notna().any():
            min_date = filtered[order_date_col].min().date()
            max_date = filtered[order_date_col].max().date()
            presets = ["Full Range", "Last 24 Months", "Last 12 Months", "Year 2014"]
            quick_pick = st.selectbox("Quick Window", options=presets, index=0)

            if quick_pick == "Last 24 Months":
                preset_start = max(min_date, pd.Timestamp(max_date) - pd.DateOffset(months=24)).date()
                preset_end = max_date
            elif quick_pick == "Last 12 Months":
                preset_start = max(min_date, pd.Timestamp(max_date) - pd.DateOffset(months=12)).date()
                preset_end = max_date
            elif quick_pick == "Year 2014":
                preset_start = max(min_date, pd.Timestamp("2014-01-01").date())
                preset_end = min(max_date, pd.Timestamp("2014-12-31").date())
            else:
                preset_start = min_date
                preset_end = max_date

            selected_dates = st.date_input(
                "Order Date Range",
                value=(preset_start, preset_end),
                min_value=min_date,
                max_value=max_date,
            )
            if isinstance(selected_dates, tuple) and len(selected_dates) == 2:
                start_date, end_date = selected_dates
                filtered = filtered[
                    (filtered[order_date_col].dt.date >= start_date)
                    & (filtered[order_date_col].dt.date <= end_date)
                ]
                full_days = max((max_date - min_date).days, 1)
                selected_days = max((end_date - start_date).days, 1)
                date_coverage = selected_days / full_days

    with st.sidebar.expander("Business Segments", expanded=True):
        for key, label in [
            ("region", "Region"),
            ("segment", "Segment"),
            ("category", "Category"),
            ("sub_category", "Sub-Category"),
            ("state", "State"),
        ]:
            col = schema[key]
            if col is None:
                continue
            options = sorted([x for x in filtered[col].dropna().unique().tolist()])
            if not options:
                continue
            selected = st.multiselect(label, options=options, default=options)
            if selected:
                filtered = filtered[filtered[col].isin(selected)]

    with st.sidebar.expander("Numeric Ranges", expanded=True):
        for key, label in [("sales", "Sales"), ("profit", "Profit"), ("discount", "Discount")]:
            col = schema[key]
            if col is None or filtered[col].dropna().empty:
                continue
            low = float(filtered[col].quantile(0.01))
            high = float(filtered[col].quantile(0.99))
            if low == high:
                continue
            lo_sel, hi_sel = st.slider(
                f"{label} Range",
                min_value=float(filtered[col].min()),
                max_value=float(filtered[col].max()),
                value=(low, high),
            )
            filtered = filtered[(filtered[col] >= lo_sel) & (filtered[col] <= hi_sel)]

    if "discount_bucket" in filtered.columns:
        with st.sidebar.expander("Discount Behavior", expanded=True):
            discount_opts = [x for x in filtered["discount_bucket"].dropna().unique().tolist()]
            if discount_opts:
                selected_bucket = st.multiselect(
                    "Discount Bucket",
                    options=discount_opts,
                    default=discount_opts,
                )
                if selected_bucket:
                    filtered = filtered[filtered["discount_bucket"].isin(selected_bucket)]

    context = {
        "date_coverage": date_coverage,
    }
    return filtered, context


def main() -> None:
    inject_global_styles()

    st.markdown('<div class="dashboard-title">SuperStore Sales Analytics</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="dashboard-subtitle">Revenue analysis with interactive filtering, profitability metrics, and strategic insights.</div>',
        unsafe_allow_html=True,
    )

    try:
        df, schema = load_and_prepare_data()
    except Exception as exc:
        st.error(f"Unable to load dataset: {exc}")
        st.stop()

    filtered, context = apply_filters(df, schema)

    sales_col = schema["sales"]
    profit_col = schema["profit"]
    discount_col = schema["discount"]
    order_date_col = schema["order_date"]
    category_col = schema["category"]
    sub_category_col = schema["sub_category"]
    region_col = schema["region"]
    segment_col = schema["segment"]

    if filtered.empty:
        st.warning("No rows match current filters. Please broaden filters.")
        st.stop()

    total_sales = float(filtered[sales_col].sum()) if sales_col else np.nan
    total_profit = float(filtered[profit_col].sum()) if profit_col else np.nan
    total_orders = int(len(filtered))
    loss_orders = int((filtered[profit_col] < 0).sum()) if profit_col else 0
    loss_share = (loss_orders / total_orders) if total_orders else 0.0
    profit_margin = (total_profit / total_sales) if sales_col and total_sales else np.nan
    avg_discount = float(filtered[discount_col].mean()) if discount_col else np.nan

    st.markdown("### KPI Cockpit")
    c1, c2, c3, c4, c5, c6 = st.columns(6)
    with c1:
        render_kpi_card("Total Sales", format_money(total_sales), "Revenue in selected scope")
    with c2:
        render_kpi_card("Total Profit", format_money(total_profit), "Net gain after discounts")
    with c3:
        render_kpi_card("Profit Margin", f"{profit_margin:.2%}" if pd.notna(profit_margin) else "N/A", "Profitability quality")
    with c4:
        render_kpi_card("Orders", f"{total_orders:,}", f"Coverage {context['date_coverage']:.0%} of timeline")
    with c5:
        render_kpi_card("Loss Orders", f"{loss_orders:,}", f"Loss share {loss_share:.1%}")
    with c6:
        render_kpi_card("Avg Discount", f"{avg_discount:.2%}" if pd.notna(avg_discount) else "N/A", "Pricing pressure indicator")

    with st.container(border=False):
        pass

    tab1, tab2, tab3, tab4 = st.tabs(
        [
            "Executive Overview",
            "Profit Leakage Lab",
            "Category and Region Studio",
            "Strategy and Story",
        ]
    )

    with tab1:
        st.subheader("Sales and Profit Momentum")
        if order_date_col is not None:
            monthly = (
                filtered.set_index(order_date_col)[[sales_col, profit_col]]
                .resample("M")
                .sum()
                .reset_index()
            )
            fig_sales = px.area(
                monthly,
                x=order_date_col,
                y=sales_col,
                title="Monthly Sales Flow",
                color_discrete_sequence=["#0B4F6C"],
            )
            fig_profit = px.line(
                monthly,
                x=order_date_col,
                y=profit_col,
                title="Monthly Profit Trajectory",
                markers=True,
                color_discrete_sequence=["#E4572E"],
            )
            fig_profit.add_hline(y=0, line_dash="dash", line_color="#111827")
            style_figure(fig_sales)
            style_figure(fig_profit)
            t1, t2 = st.columns(2)
            t1.plotly_chart(fig_sales, use_container_width=True)
            t2.plotly_chart(fig_profit, use_container_width=True)

        if category_col is not None:
            category_summary = (
                filtered.groupby(category_col, as_index=False)[[sales_col, profit_col]]
                .sum()
                .sort_values(sales_col, ascending=False)
            )
            st.subheader("Category Snapshot")
            t3, t4 = st.columns(2)

            fig_cat_sales = px.bar(
                category_summary,
                x=category_col,
                y=sales_col,
                color=category_col,
                title="Sales by Category",
                color_discrete_sequence=BAR_PALETTE,
            )
            fig_cat_profit = px.bar(
                category_summary,
                x=category_col,
                y=profit_col,
                color=category_col,
                title="Profit by Category",
                color_discrete_sequence=list(reversed(BAR_PALETTE)),
            )
            style_figure(fig_cat_sales)
            style_figure(fig_cat_profit)
            t3.plotly_chart(fig_cat_sales, use_container_width=True)
            t4.plotly_chart(fig_cat_profit, use_container_width=True)

    with tab2:
        st.subheader("Discount and Profit Interaction")

        topn = st.slider("Top N Loss Sub-Categories", min_value=5, max_value=20, value=12)

        if discount_col is not None and profit_col is not None:
            scatter_df = filtered[[discount_col, profit_col]].dropna().copy()
            if len(scatter_df) > 7000:
                scatter_df = scatter_df.sample(7000, random_state=42)
            fig_scatter = px.scatter(
                scatter_df,
                x=discount_col,
                y=profit_col,
                opacity=0.55,
                title="Discount vs Profit (Interactive Sample)",
                color=profit_col,
                color_continuous_scale="RdYlGn",
            )
            fig_scatter.add_hline(y=0, line_dash="dash", line_color="#111827")
            style_figure(fig_scatter)
            st.plotly_chart(fig_scatter, use_container_width=True)

        if "discount_bucket" in filtered.columns:
            bucket_profit = (
                filtered.groupby("discount_bucket", observed=False)[profit_col]
                .mean()
                .reset_index()
                .sort_values(profit_col)
            )
            fig_bucket = px.bar(
                bucket_profit,
                x="discount_bucket",
                y=profit_col,
                color="discount_bucket",
                title="Average Profit by Discount Bucket",
                color_discrete_sequence=BAR_PALETTE,
            )
            fig_bucket.add_hline(y=0, line_dash="dash", line_color="#111827")
            style_figure(fig_bucket)
            st.plotly_chart(fig_bucket, use_container_width=True)

        if sub_category_col is not None:
            loss_sub = (
                filtered.groupby(sub_category_col, as_index=False)[profit_col]
                .sum()
                .sort_values(profit_col, ascending=True)
                .head(topn)
            )
            fig_loss = px.bar(
                loss_sub,
                x=profit_col,
                y=sub_category_col,
                color=sub_category_col,
                orientation="h",
                title=f"Top {topn} Loss-Making Sub-Categories",
                color_discrete_sequence=BAR_PALETTE,
            )
            style_figure(fig_loss)
            st.plotly_chart(fig_loss, use_container_width=True)

    with tab3:
        st.subheader("Category and Region Performance Studio")

        d1, d2 = st.columns(2)

        if category_col is not None:
            cat_perf = (
                filtered.groupby(category_col, as_index=False)[[sales_col, profit_col]]
                .sum()
                .sort_values(sales_col, ascending=False)
            )
            fig_cat = px.bar(
                cat_perf,
                x=category_col,
                y=[sales_col, profit_col],
                barmode="group",
                title="Category Sales vs Profit",
                color_discrete_sequence=["#0B4F6C", "#E4572E"],
            )
            style_figure(fig_cat)
            d1.plotly_chart(fig_cat, use_container_width=True)

        if region_col is not None:
            reg_perf = (
                filtered.groupby(region_col, as_index=False)[[sales_col, profit_col]]
                .sum()
                .sort_values(sales_col, ascending=False)
            )
            fig_reg = px.bar(
                reg_perf,
                x=region_col,
                y=sales_col,
                color=region_col,
                title="Sales by Region",
                color_discrete_sequence=BAR_PALETTE,
            )
            style_figure(fig_reg)
            d2.plotly_chart(fig_reg, use_container_width=True)

        st.subheader("Performance Tables")
        e1, e2 = st.columns(2)
        if category_col is not None:
            e1.dataframe(
                filtered.groupby(category_col)[[sales_col, profit_col]].sum().sort_values(sales_col, ascending=False),
                use_container_width=True,
            )
        if segment_col is not None:
            e2.dataframe(
                filtered.groupby(segment_col)[[sales_col, profit_col]].sum().sort_values(sales_col, ascending=False),
                use_container_width=True,
            )

    with tab4:
        st.subheader("Strategy Storyboard")

        findings = []
        if category_col is not None:
            top_sales_cat = filtered.groupby(category_col)[sales_col].sum().sort_values(ascending=False).index[0]
            top_profit_cat = filtered.groupby(category_col)[profit_col].sum().sort_values(ascending=False).index[0]
            findings.append(f"Top sales category: {top_sales_cat}")
            findings.append(f"Top profit category: {top_profit_cat}")
        if sub_category_col is not None:
            worst_sub = filtered.groupby(sub_category_col)[profit_col].sum().sort_values().index[0]
            findings.append(f"Most loss-making sub-category: {worst_sub}")
        if "discount_bucket" in filtered.columns:
            worst_bucket = (
                filtered.groupby("discount_bucket", observed=False)[profit_col]
                .mean()
                .sort_values()
                .index[0]
            )
            findings.append(f"Weakest discount bucket by average profit: {worst_bucket}")

        st.markdown("#### Priority Findings")
        for idx, line in enumerate(findings, start=1):
            st.markdown(f"{idx}. {line}")

        st.markdown("#### Model Notes")
        st.info(
            "Best regression model: RandomForestRegressor (R2 ~ 0.705, CV mean R2 ~ 0.676).\n"
            "Best classification model: RandomForestClassifier (F1 ~ 0.858, Accuracy ~ 0.931)."
        )

        st.markdown("#### Management Actions")
        st.markdown(
            "1. Introduce discount guardrails for high-risk deal bands.\n"
            "2. Prioritize profitable categories by region for sales planning.\n"
            "3. Trigger loss-risk alerts before final discount approvals.\n"
            "4. Track bottom sub-categories with monthly owner reviews."
        )

        st.markdown("#### Skills Demonstrated")
        st.markdown(
            "- Data engineering with mixed-format date correction and schema hardening.\n"
            "- End-to-end analytics: EDA, model validation, and executive reporting.\n"
            "- Product-grade dashboarding with interactive filters and clean storytelling.\n"
            "- Full-stack presentation layer: custom CSS, chart theming, and KPI componentization."
        )

    # Footer
    st.markdown(
        """
        <div class="footer-section">
            <div>SuperStore Sales Analytics Dashboard</div>
            <div class="footer-credit">Design & Developed by Data Analytics Team - Abu</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    main()
