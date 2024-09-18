from .models import ChatOption, Chat
from .constants import N_BEST_TOKENS_TYPE, N_LAST_TOKENS_TYPE
import numpy as np
from openai import OpenAI

#TODO async
#TODO model constant
def generate_vector(prompt,api_key):
    client = OpenAI(api_key=api_key)
    embedding = client.embeddings.create(input=[f"{prompt}"],model = "text-embedding-3-small").data[0].embedding
    np_embedding = np.array(embedding, dtype=np.float32)
    return np_embedding


def get_chat_context(options: ChatOption, user_prompt_tokens : int, chat : Chat, api_key : str,user_prompt : str):
    if(options.history_type == N_BEST_TOKENS_TYPE):
        messages = best_tokens_context(options, user_prompt_tokens, chat, api_key, user_prompt=user_prompt)

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


def get_context_messages(sorted_con_entries,options,user_prompt_tokens):
    tokens = user_prompt_tokens
    context_messages = []
    for con_entry in sorted_con_entries:
        if(tokens + con_entry.tokens < options.n_last_tokens):
            tokens += con_entry.tokens
            context_messages.append(context_message("assistant",con_entry.ai_response.text))
            context_messages.append(context_message("user",con_entry.user_prompt.text))
        elif(tokens + con_entry.ai_response.tokens < options.n_last_tokens):
            # naporcuju user message a pridam
            tokens += con_entry.ai_response.tokens
            context_messages.append(context_message("assistant",con_entry.ai_response.text))
            shorten_message = shorten_the_message(con_entry.user_prompt.text,con_entry.user_prompt.tokens,options.n_last_tokens - tokens)
            context_messages.append(context_message("user",shorten_message))
            break
        else:
            # naporcuju ai message a pridam
            shorten_message = shorten_the_message(con_entry.ai_response.text,con_entry.ai_response.tokens,options.n_last_tokens - tokens)
            context_messages.append(context_message("assistant",shorten_message))
            break
    return context_messages

#TODO token count v databazi generuji ruzne modely, kdyz pak zmenim model mohlo by se posrat
#TODO pridat constant fora kvuli nepresnosti od tiktoken
def last_tokens_context(options : ChatOption, user_prompt_tokens : int, chat : Chat):
    # get the chat entries, sorted with the newest first in list
    con_entries = sorted(chat.conversation_entries, key=lambda entry: entry.timestamp, reverse=True)
    if(con_entries == []):
        return []

    context_messages = get_context_messages(con_entries,options,user_prompt_tokens)
    return context_messages    

#TODO token count v databazi generuji ruzne modely, kdyz pak zmenim model mohlo by se posrat
#TODO pridat constant fora kvuli nepresnosti od tiktoken
def best_tokens_context(options : ChatOption, user_prompt_tokens : int, chat : Chat, api_key : str,user_prompt: str):
    con_entries = chat.conversation_entries
    if(con_entries == []):
        return []

    embeddings  = np.array([np.frombuffer(con_entry.embedding, dtype=np.float32) for con_entry in con_entries ])
    prompt_embedding = generate_vector(user_prompt,api_key)

    #compute cosine similarities
    similarities = np.dot(embeddings,prompt_embedding)/(np.linalg.norm(embeddings, axis=1) * np.linalg.norm(prompt_embedding))
    sorted_indices = np.argsort(-similarities)

    sorted_con_entries = [ con_entries[i] for i in sorted_indices]

    context_messages = get_context_messages(sorted_con_entries,options,user_prompt_tokens)
    return context_messages    

    