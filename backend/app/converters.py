import app.schemas as schemas
import app.models as models


def chat_model_to_chat_schema(chat_model: models.Chat) -> schemas.ChatResponse:
    options = schemas.Options(**chat_model.option)
    conversation_entries_models_list = chat_model.conversation_entries 
    conversation_entries_schemas_list = [schemas.ConversationEntry(
        user_prompt = con_entry.user_prompt.text,
        ai_response = con_entry.ai_response.text,
        cost = con_entry.cost,
        time = con_entry.timestamp
        ) for con_entry in conversation_entries_models_list]
    return schemas.ChatResponse(options=options,conversation_entries = conversation_entries_schemas_list)

