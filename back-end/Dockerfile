# ベースイメージの選択
FROM python:3.9

# 作業ディレクトリの設定
WORKDIR /app

# 依存関係のインストール
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションのコピー
COPY . .

# 起動コマンドの指定
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
