from .schemas import LLModel

DEFAULT_CHAT = LLModel(name="gpt-4o-mini",displayName="GPT-4o-mini",context_limit=128_000,input_tokens_price = 0.15, output_tokens_price = 0.6 )

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