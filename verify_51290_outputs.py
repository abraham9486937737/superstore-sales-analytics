import json

notebooks = [
    'notebooks/superstore_school_style_tutorial.ipynb',
    'notebooks/superstore_interview_presentation.ipynb',
    'notebooks/superstore_end_to_end_analysis.ipynb',
]

for nb_path in notebooks:
    with open(nb_path, 'r', encoding='utf-8') as f:
        nb = json.load(f)

    print('\n' + '=' * 70)
    print(nb_path)

    hit = False
    for i, cell in enumerate(nb['cells'], 1):
        if cell.get('cell_type') != 'code':
            continue
        for output in cell.get('outputs', []):
            text = ''.join(output.get('text', output.get('data', {}).get('text/plain', [])))
            if 'Shape:' in text or 'Raw shape:' in text or 'Rows before duplicate removal:' in text:
                if ('51290' in text) or ('51,290' in text):
                    print(f'Cell {i}:')
                    print(text[:250].strip())
                    hit = True
                    break
        
    if not hit:
        print('No 51,290-row evidence found in captured stdout snippets.')
