from openai import OpenAI

client = OpenAI(api_key="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")

chat_completion = client.chat.completions.create(
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {
            "role": "user",
            "content": "Give me a code in c that prints hello world",
        }
    ],
    model="gpt-3.5-turbo",
)
print(chat_completion)

ChatCompletionChunk(id='chatcmpl-9z3w0nO9e1qEdmM60N4GMwbiJei2R', choices=[Choice(delta=ChoiceDelta(content='Hello', function_call=None, refusal=None, role=None, tool_calls=None), finish_reason=None, index=0, logprobs=None)], created=1724340160, model='gpt-3.5-turbo-0125', object='chat.completion.chunk', service_tier=None, system_fingerprint=None, usage=None)