# SuperStore Sales Analytics

End-to-end retail analytics portfolio project built from raw SuperStore order data to business storytelling, machine learning, and interactive dashboards.

## Project Highlights

- Cleaned and standardized multi-column retail order data
- Performed exploratory and statistical analysis across sales, profit, discount, region, segment, and product performance
- Built predictive models for profit behavior and loss-risk analysis
- Created two interactive experiences:
  - a Streamlit dashboard for analytics storytelling
  - a React dashboard for portfolio-style presentation

## Key Business Insights

- Technology emerged as the strongest profit-driving category in the consolidated review
- Tables consistently appeared as the biggest loss-making sub-category
- High discounting was strongly associated with weaker profitability
- Regional performance was uneven, showing clear opportunities for targeted pricing and product strategy
- Sales momentum improved toward the later period of the analysis window

## Tech Stack

Python, pandas, numpy, scikit-learn, plotly, Streamlit, React, Vite, Tailwind CSS

## Repository Structure

- `app.py` — Streamlit dashboard
- `notebooks/` — three notebook variants for end-to-end, interview, and tutorial storytelling
- `src/frontend/` — React dashboard
- `reports/` — publishing notes and supporting documentation

## Run Locally

### Streamlit

```bash
pip install -r requirements.txt
streamlit run app.py
```

### React dashboard

```bash
cd src/frontend
npm install
npm run dev
```

## Deployment Targets

- GitHub repository: https://github.com/abraham9486937737/superstore-sales-analytics
- GitHub Pages frontend: https://abraham9486937737.github.io/superstore-sales-analytics/
- Hugging Face Space: add your live Space URL here after deployment

## Portfolio Value

This project demonstrates the full analytics workflow:

1. data quality review
2. business-focused EDA
3. statistical insight generation
4. machine learning evaluation
5. dashboard-based stakeholder communication

## Author

Abraham
