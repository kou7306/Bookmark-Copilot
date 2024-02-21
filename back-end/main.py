from flask import jsonify
import requests
from bs4 import BeautifulSoup
from openai import OpenAI
from dotenv import load_dotenv
import os
from flask import Flask

app = Flask(__name__)

def select_folder(folderlist,info):

    result = ", ".join([f"'{item}'" for item in folderlist])
    # .env ファイルから環境変数を読み込む
    load_dotenv()

    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
    )

    # GPTによる応答生成
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "あなたはブックマークしたURLの情報を元にフォルダを選ぶプロです。"},
            {"role": "user", "content": f"今回ブックマークされたURLの情報は{info}です。このURLをフォルダ分けする時、{result}の中から一番適切なフォルダ名を選んでください。答えはフォルダ名だけで答えてください。"}
        ]
    )

    return completion.choices[0].message.content

def fetch_title_and_meta(url):
    # url = request.args.get('url')
    if not url:
        return 'URL query parameter is required', 400

    title, description, keywords = fetch_head_tags(url)
    info = f"urlは{url},titleは{title},descriptionは{description},keywordsは{keywords}"
    folderlist=['技術','アニメ','スポーツ']
    folder=select_folder(folderlist,info)
    print(folder)

    return folder
    

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
    
@app.route('/')
def index():
    f=fetch_title_and_meta('https://fuji-pocketbook.net/chatgpt-api-python/')
    print(f)
    return f




if __name__ == '__main__':
    app.run(debug=True)