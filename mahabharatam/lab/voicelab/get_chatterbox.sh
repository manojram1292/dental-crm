#!/usr/bin/env bash
# Downloads the Chatterbox ONNX model (MIT) used by lab/voicelab/cb.py into lab/voicelab/venv/models/cb/
set -e; D="$(cd "$(dirname "$0")" && pwd)/venv/models/cb"; mkdir -p "$D/onnx"; cd "$D"
B=https://huggingface.co/onnx-community/chatterbox-ONNX/resolve/main
for f in tokenizer.json default_voice.wav onnx/embed_tokens.onnx onnx/embed_tokens.onnx_data onnx/language_model_q4.onnx onnx/language_model_q4.onnx_data onnx/conditional_decoder.onnx onnx/conditional_decoder.onnx_data onnx/speech_encoder.onnx onnx/speech_encoder.onnx_data; do
  curl -s -L --retry 5 -C - -o $f $B/$f || echo FAIL $f
done
for f in tokenizer_config.json config.json preprocessor_config.json generation_config.json; do curl -s -L --retry 5 -o $f $B/$f || echo FAIL $f; done
echo DONE
