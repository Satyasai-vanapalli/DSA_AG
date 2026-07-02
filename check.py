import urllib.request
import re

content = urllib.request.urlopen('https://dsa-ag.vercel.app/assets/index-EHOtOHMR.js').read().decode('utf-8')
matches = re.findall(r'https?://[^\s"\'\`]*onrender\.com[^\s"\'\`]*|http://localhost:8081/api', content)
print(list(set(matches)))
