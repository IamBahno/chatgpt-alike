from .schemas import LLModel

N_LAST_TOKENS_TYPE = "N_LAST_TOKENS_TYPE"
N_BEST_TOKENS_TYPE = "N_BEST_TOKENS_TYPE"

DEFAULT_CHAT = LLModel(name="gpt-4o-mini",displayName="GPT-4o-mini",context_limit=128_000,input_tokens_price = 0.15, output_tokens_price = 0.6 )

EMBEDDING_MODEL = "text-embedding-3-small"

TITLE_GENERATOR_INSTRUCTIONS = "You are a tool used to generate name of chat, based on user prompt. Return only the name of the chat. Dont put any quotes around the name or anything. And try to make it max 4 words long."
MODEL_INSTRUCIONS = "You are helpful assistant. You generate responses in markup."

TOKEN_SAFETY_MARGIN = 150

models = [  LLModel(name="gpt-3.5-turbo",displayName="GPT-3.5-turbo",context_limit=16_385,input_tokens_price = 0.5, output_tokens_price = 1.5 ),
            LLModel(name="gpt-4o-mini",displayName="GPT-4o-mini",context_limit=128_000,input_tokens_price = 0.15, output_tokens_price = 0.6 ),
            LLModel(name="gpt-4",displayName="GPT-4",context_limit=8192,input_tokens_price = 30, output_tokens_price = 60 ),
        ]

def get_model(name : str):
    for model in models:
        if(model.name == name):
            return model
    return None

def get_all_models():
    return models