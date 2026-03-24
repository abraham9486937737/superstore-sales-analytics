# SuperStore Sales Data Analytics

Data analytics project for exploring and modeling SuperStore sales data.

## Overview

This repository contains datasets, notebooks, and project folders for analyzing SuperStore order data. The current workspace includes raw CSV files, a requirements file for the Python environment, and standard directories for processed data, models, reports, and source code.

## Project Structure

- `data/raw/` - raw input datasets
- `data/processed/` - cleaned and transformed datasets
- `models/` - trained model artifacts
- `notebooks/` - Jupyter notebooks for exploration and experiments
- `reports/` - generated reports and exports
- `src/` - reusable project code
- `requirements.txt` - Python dependencies

## Setup

1. Create and activate a Python environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Launch Jupyter Lab or your preferred notebook environment.

## Data

The repository currently includes SuperStore order datasets used for analysis. Review the dataset source and licensing terms before sharing the repository publicly.

## Library Selection Notes (Why We Use Each)

This project uses each library with a specific purpose, so reviewers can understand not just what we used, but why.

### Core Data Handling

- `pandas` - Main tool for loading CSV files, cleaning columns, handling dates, and building analysis-ready tables.
- `numpy` - Fast numerical operations and array utilities used under the hood by most analytics and ML workflows.

### Visualization and Reporting

- `matplotlib` - Base plotting library for reliable static charts.
- `seaborn` - High-level statistical visualization built on matplotlib, used for cleaner exploratory plots.
- `plotly` - Interactive charts for dashboards and presentation-style exploration.

### Statistical Analysis

- `scipy` - Scientific computing functions (distributions, tests, optimization helpers).
- `statsmodels` - Interpretable statistical modeling and hypothesis-driven analysis.

### Machine Learning Models

- `scikit-learn` - End-to-end ML utilities: preprocessing, model training pipelines, metrics, and validation.
- `xgboost` - High-performance gradient boosting for strong predictive baselines.
- `lightgbm` - Fast gradient boosting for large/tabular datasets.
- `catboost` - Boosting model with good support for categorical feature handling.
- `imbalanced-learn` - Resampling strategies (like SMOTE) for class-imbalance problems.

### Explainability and Optimization

- `shap` - Model explainability (feature impact and local/global prediction interpretation).
- `optuna` - Hyperparameter tuning with efficient search strategies.

### Experiment Tracking and App Layer

- `mlflow` - Tracks experiments, parameters, metrics, and model artifacts.
- `streamlit` - Quick deployment of an interactive data app for stakeholders.

### Notebook and Environment Tooling

- `jupyterlab` - Interactive notebook environment for EDA and iterative modeling.
- `ipykernel` - Kernel support so the selected Python environment runs in notebooks.

### Reusable Note Template

When adding a new library, document it in this format:

- `Library Name` - What problem it solves in this project.
- `Why this over alternatives` - One-line tradeoff decision.
- `Where used` - Notebook/script path.
- `Risk/limitation` - Any known caveat.