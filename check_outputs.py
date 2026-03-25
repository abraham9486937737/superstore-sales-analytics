import json

def check_load_cells(nb_path):
    with open(nb_path, 'r', encoding='utf-8') as f:
        nb = json.load(f)
    
    print(f"\n{'='*60}")
    print(f"NOTEBOOK: {nb_path}")
    print(f"Total cells: {len(nb['cells'])}")
    
    # Find cells with 'Loaded from' in output (data load cells)
    for i, cell in enumerate(nb['cells'], 1):
        if cell.get('cell_type') != 'code':
            continue
        for output in cell.get('outputs', []):
            text = ''.join(output.get('text', output.get('data', {}).get('text/plain', [])))
            if 'Loaded from' in text or 'Shape:' in text or '20067' in text or '51290' in text:
                print(f"\nCell {i} (id={cell.get('id','?')}):")
                print(text[:400])
                break

check_load_cells('notebooks/superstore_school_style_tutorial.ipynb')
check_load_cells('notebooks/superstore_interview_presentation.ipynb')
check_load_cells('notebooks/superstore_end_to_end_analysis.ipynb')
