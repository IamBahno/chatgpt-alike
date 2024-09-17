from .models import ChatOption
from .constants import N_BEST_TOKENS_TYPE, N_LAST_TOKENS_TYPE

def get_chat_context(options: ChatOption, user_prompt_len : int):
    if(options.history_type == N_BEST_TOKENS_TYPE):
        pass
    elif(options.history_type==N_LAST_TOKENS_TYPE):
        pass
    else:
        raise Exception
    
def last_tokens_context(options : ChatOption, user_prompt_len : int):
    pass

def best_tokens_context(options : ChatOption, user_prompt_len : int):
    pass