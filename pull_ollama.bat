:loop
echo Pulling Ollama model (llama3.2)...
ollama pull llama3.2
if %errorlevel% neq 0 (
    echo Network error detected for llama3.2. Retrying in 5 seconds...
    timeout /t 5
    goto loop
)
echo Successfully pulled llama3.2!

:loop2
echo Pulling Ollama embedding model (nomic-embed-text)...
ollama pull nomic-embed-text
if %errorlevel% neq 0 (
    echo Network error detected for nomic-embed-text. Retrying in 5 seconds...
    timeout /t 5
    goto loop2
)
echo Successfully pulled nomic-embed-text!
echo All models pulled successfully!
