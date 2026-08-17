# Local AI (Ollama)

Chạy AI ngay trên máy thay vì gọi OpenRouter, dùng [Ollama](https://ollama.com).
Backend tự chuyển qua lại giữa cloud (`openrouter`) và local (`local`) qua config
trong trang admin `/admin/ai-models` — không cần deploy lại code.

## 1. Cài Ollama

Trên macOS (Apple Silicon), cài native để tận dụng GPU Metal (không dùng Docker,
vì Docker trên Mac không pass-through được Metal):

```bash
brew install ollama
# hoặc tải app tại https://ollama.com/download
```

Khởi động server:

```bash
ollama serve
```

Mặc định Ollama lắng nghe tại `http://localhost:11434` và có sẵn REST API
tương thích OpenAI tại `/v1/chat/completions`.

## 2. Pull model

Chạy script tiện:

```bash
./local-ai/pull-models.sh
```

Hoặc pull thủ công:

```bash
ollama pull qwen2.5vl:7b   # vision — dùng cho panel_detection
ollama pull qwen2.5:14b    # text — dùng cho narration + translate
```

Nếu máy RAM hạn chế, dùng bản nhẹ hơn: `qwen2.5:7b` thay cho `qwen2.5:14b`,
hoặc `llama3.2-vision:11b` thay cho `qwen2.5vl:7b`.

## 3. Cấu hình trong app

1. Vào `/admin/ai-models`.
2. Tạo config mới: `provider = local`, `modelId` = đúng tên model đã pull
   (vd: `qwen2.5vl:7b`), `taskType` tương ứng, API key nhập tùy ý (không dùng tới).
3. Bấm "Kích hoạt" để dùng config đó thay cho OpenRouter.

Nếu Ollama chạy trên máy/host khác (không phải localhost), set biến môi trường
backend `OLLAMA_BASE_URL` (xem `backend/.env.example`) trỏ tới địa chỉ đó,
vd: `http://192.168.1.20:11434`.
