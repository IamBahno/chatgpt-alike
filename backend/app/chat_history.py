from .models import ChatOption, Chat
from .constants import N_BEST_TOKENS_TYPE, N_LAST_TOKENS_TYPE

def get_chat_context(options: ChatOption, user_prompt_tokens : int, chat : Chat):
    if(options.history_type == N_BEST_TOKENS_TYPE):
        messages = best_tokens_context(options, user_prompt_tokens, chat)

    elif(options.history_type==N_LAST_TOKENS_TYPE):
        messages = last_tokens_context(options, user_prompt_tokens, chat)

    else:
        raise Exception
    return messages

def context_message(role: str, message: str):
    if(role not in ["system", "user", "assistant"]):
        raise Exception
    return {"role":role,"content":message}

#TODO pridat constant fora kvuli nepresnosti od tiktoken
# i split the message into half until it fits
def shorten_the_message(msg : str, msg_tokens : int, max_tokens):
    index = len(msg) - 1
    while(True):
        if( msg_tokens // 2 < max_tokens ):
            index = index // 2
            break
        else:
            msg_tokens = msg_tokens // 2
            index = index // 2
    return msg[:index]

#TODO token count v databazi generuji ruzne modely, kdyz pak zmenim model mohlo by se posrat
#TODO pridat constant fora kvuli nepresnosti od tiktoken
#TODO otestovat pro pripady kdy se musi zkracovat
def last_tokens_context(options : ChatOption, user_prompt_tokens : int, chat : Chat):
    # get the chat entries, sorted with the newest first in list
    con_entries = sorted(chat.conversation_entries, key=lambda entry: entry.timestamp, reverse=True)
    tokens = user_prompt_tokens
    context_messages = []
    for con_entry in con_entries:
        if(tokens + con_entry.tokens < options.n_last_tokens):
            tokens += con_entry.tokens
            context_messages.append(context_message("assistant",con_entry.ai_response.text))
            context_messages.append(context_message("user",con_entry.user_prompt.text))
        elif(tokens + con_entry.ai_response.tokens < options.n_last_tokens):
            tokens += con_entry.ai_response.tokens
            context_messages.append(context_message("assistant",con_entry.ai_response.text))
            shorten_message = shorten_the_message(con_entry.user_prompt.text,con_entry.user_prompt.tokens,options.n_last_tokens - tokens)
            context_messages.append(context_message("user",shorten_message))
            break
        else:
            # naporcuju ai message a pridam
            shorten_message = shorten_the_message(con_entry.ai_response.text,con_entry.ai_response.tokens,options.n_last_tokens - tokens)
            context_messages.append(context_message("assistant",shorten_message))
    return context_messages    

#TODO
def best_tokens_context(options : ChatOption, user_prompt_len : int, chat : Chat):
    pass