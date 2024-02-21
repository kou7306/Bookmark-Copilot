from openai import OpenAI
from dotenv import load_dotenv
import os

def answer_chatGPT(folderlist,info):

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


print(answer_chatGPT(["Python", "JavaScript", "Ruby"], "Pythonの公式サイトです。"))


