```bash
docker build -t game .
docker run -v $(pwd)/app:/app -p 8003:8003 game
```
