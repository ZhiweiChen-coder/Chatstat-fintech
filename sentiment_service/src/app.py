# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Literal
import os
import json
import requests
from openai import AzureOpenAI
from fastapi.responses import JSONResponse
import yfinance as yf
import datetime

from dotenv import load_dotenv
load_dotenv()

AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Sentiment service is running"}

class SentimentRequest(BaseModel):
    text: str
    lang: Literal['en', 'zh', 'multi'] = 'en'

gpt_client = AzureOpenAI(
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_key=AZURE_OPENAI_KEY,
    api_version="2025-03-01-preview",
)

@app.post("/api/sentiment/analyze")
async def analyze_sentiment(req: SentimentRequest):
    if not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_KEY:
        raise HTTPException(status_code=500, detail="Missing Azure OpenAI configuration")

    prompt = f"""Analyze the sentiment of the following text in a financial context.\nClassify as one of: positive, negative, or neutral.\nThen explain the reasoning in 1-2 sentences.\n\nText: {req.text}\nReturn JSON format with keys: label, score (0-1), and insight."""

    try:
        response = gpt_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a financial sentiment analyst."},
                {"role": "user", "content": prompt},
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Azure OpenAI error: {str(e)}")

@app.get("/api/tesla/price")
def get_tesla_price():
    # Fetch last 3 months of TSLA data
    end = datetime.datetime.now()
    start = end - datetime.timedelta(days=90)
    data = yf.download('TSLA', start=start, end=end)
    # Format for Highcharts: [timestamp, price]
    price_data = [
        [int(row[0].timestamp() * 1000), row[1]['Close']]
        for row in data.iterrows()
    ]
    return JSONResponse(content={"prices": price_data})