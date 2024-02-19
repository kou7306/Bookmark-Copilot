from flask import jsonify
import requests
from bs4 import BeautifulSoup

def fetch_title_and_meta(request):
    url = request.args.get('url')
    if not url:
        return 'URL query parameter is required', 400

    title, description, keywords = fetch_head_tags(url)
    if title:
        return jsonify({'title': title, 'description': description, 'keywords': keywords})
    else:
        return 'Title tag not found', 404

def fetch_head_tags(url):
    with requests.get(url, stream=True) as response:
        data = ''
        for chunk in response.iter_content(chunk_size=1024):
            data += chunk.decode('utf-8')
            if '</head>' in data:
                break
        soup = BeautifulSoup(data, 'html.parser')
        title = soup.title.string if soup.title else None
        description = soup.find('meta', attrs={'name': 'description'})
        description = description['content'] if description else None
        keywords = soup.find('meta', attrs={'name': 'keywords'})
        keywords = keywords['content'] if keywords else None
        return title, description, keywords




