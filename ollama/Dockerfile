FROM ollama/ollama:latest

# Start Ollama in the background, wait for it to be ready, and pull the required models
RUN bash -c "ollama serve & \
    sleep 5 && \
    ollama pull llama3.2 && \
    ollama pull nomic-embed-text && \
    wait"

# Expose the default Ollama port
EXPOSE 11434

# Start Ollama when the container runs
ENTRYPOINT ["ollama", "serve"]
