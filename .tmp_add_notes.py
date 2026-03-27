import json
from pathlib import Path

ROOT = Path(r"e:/DA&DS_Files/SuperStore_Sales_Data_Analytics_Kaggle")
NOTEBOOKS = [
    ROOT / "notebooks" / "superstore_end_to_end_analysis.ipynb",
    ROOT / "notebooks" / "superstore_interview_presentation.ipynb",
    ROOT / "notebooks" / "superstore_school_style_tutorial.ipynb",
]

def summarize_code(lines):
    text = "\n".join(lines).lower()
    if "import " in text:
        return "Import Libraries", "Loads the Python libraries needed for this lesson."
    if "read_csv" in text or "data_path" in text:
        return "Load Dataset", "Reads the dataset file into a DataFrame for analysis."
    if ".head(" in text:
        return "Preview Rows", "Shows the first rows so learners can see data structure."
    if ".shape" in text:
        return "Check Dataset Size", "Displays the number of rows and columns."
    if "isna(" in text or "isnull(" in text:
        return "Check Missing Values", "Counts null values to identify data quality issues."
    if ".describe(" in text:
        return "Summary Statistics", "Shows count, mean, standard deviation, min, and max for numeric columns."
    if "dtypes" in text:
        return "Check Data Types", "Displays each column type to confirm correct formats."
    if "drop_duplicates" in text:
        return "Handle Duplicate Rows", "Removes duplicate rows to improve data quality."
    if "to_datetime" in text or "to_numeric" in text:
        return "Convert Data Types", "Converts columns into correct date and numeric formats."
    if "groupby" in text:
        return "Group and Aggregate", "Groups data and calculates summary values."
    if "sns." in text or "plt." in text:
        return "Create Visualization", "Builds charts to understand patterns in the data."
    if "train_test_split" in text:
        return "Split Data", "Separates data into training and testing sets."
    if "fit(" in text and ("model" in text or "pipeline" in text):
        return "Train Model", "Trains a machine learning model on the training data."
    if "predict(" in text:
        return "Make Predictions", "Generates predictions using a trained model."
    if "score" in text or "accuracy" in text or "r2" in text or "mae" in text:
        return "Evaluate Model", "Calculates performance metrics to judge model quality."
    return "Code Step", "Runs the next step of the analysis workflow."


def make_markdown(step_no, title, description):
    return [
        f"### Step {step_no}: {title}",
        "",
        "Why this block exists:",
        f"- {description}",
        "- It is kept as a separate step so beginners can learn one concept at a time.",
    ]

for nb_path in NOTEBOOKS:
    with nb_path.open("r", encoding="utf-8") as f:
        nb = json.load(f)

    original = nb.get("cells", [])
    new_cells = []
    inserted = 0
    code_idx = 0

    for cell in original:
        if cell.get("cell_type") == "code":
            code_idx += 1
            prev = new_cells[-1] if new_cells else None
            has_markdown_before = bool(prev and prev.get("cell_type") == "markdown")
            if not has_markdown_before:
                title, desc = summarize_code(cell.get("source", []))
                md_cell = {
                    "cell_type": "markdown",
                    "metadata": {"language": "markdown"},
                    "source": make_markdown(code_idx, title, desc),
                }
                new_cells.append(md_cell)
                inserted += 1
        new_cells.append(cell)

    nb["cells"] = new_cells

    with nb_path.open("w", encoding="utf-8") as f:
        json.dump(nb, f, indent=4)
        f.write("\n")

    print(f"Updated {nb_path.name}: inserted {inserted} markdown cells")
