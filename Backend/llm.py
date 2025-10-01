from openai import OpenAI
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

openai_api_key = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=openai_api_key)
language_model = "gpt-5-nano"

# getTextResponse receive text and ask LLM for answer
def getTextResponse(text):
	chat_completion = openai_client.chat.completions.create(
    	messages=[{"role": "user", "content": text}], model=language_model
	)
	return chat_completion.choices[0].message.content

text_embedding_model = "text-embedding-3-small"
# getEmbedding receives text and response embedding (vector) of its original data
def getEmbedding(text):
    embedding = openai_client.embeddings.create(input=text, model=text_embedding_model)
    return embedding.data[0].embedding

