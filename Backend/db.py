import pymongo
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())
MONGO_URI = os.getenv("MONGODB_URI")

mongo_client = pymongo.MongoClient(MONGO_URI)

db = mongo_client.get_database("logging_semantic")  # database name in mongodb
collection = db.get_collection("cached_responses")  # collection name

def save_cache(document):
	collection.insert_one(document)

def perform_search_cache(query, threshold=0.70):
	pipeline = [
    	{
        	"$vectorSearch": {
            	"index": "vector_index_cache",
            	"path": "embeddings",
            	"queryVector": query,
            	"numCandidates": 20,
            	"limit": 1,
        	},
    	},
    	{"$addFields": {"score": {"$meta": "vectorSearchScore"}}},
    	{"$match": {"score": {"$gte": threshold}}},
    	{"$unset": ["embeddings"]},
	]
	result = collection.aggregate(pipeline)
	return result