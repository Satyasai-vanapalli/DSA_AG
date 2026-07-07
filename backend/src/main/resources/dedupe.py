import json

with open('java-curriculum.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

seen_names = set()

def dedupe(nodes):
    for node in nodes:
        original_name = node['name']
        name = original_name
        counter = 2
        while name in seen_names:
            name = f"{original_name} ({counter})"
            counter += 1
        seen_names.add(name)
        node['name'] = name
        if 'subTopics' in node:
            dedupe(node['subTopics'])

dedupe(data)

with open('java-curriculum.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print('Successfully deduped java-curriculum.json')
