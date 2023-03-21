# Alpaca.cpp

Running `make` prints the following bulid runs on macOS.

```
I llama.cpp build info:
I UNAME_S:  Darwin
I UNAME_P:  arm
I UNAME_M:  arm64
I CFLAGS:   -I.              -O3 -DNDEBUG -std=c11   -fPIC -pthread -DGGML_USE_ACCELERATE
I CXXFLAGS: -I. -I./examples -O3 -DNDEBUG -std=c++11 -fPIC -pthread
I LDFLAGS:   -framework Accelerate
I CC:       Apple clang version 14.0.0 (clang-1400.0.29.202)
I CXX:      Apple clang version 14.0.0 (clang-1400.0.29.202)

cc  -I.              -O3 -DNDEBUG -std=c11   -fPIC -pthread -DGGML_USE_ACCELERATE   -c ggml.c -o ggml.o
c++ -I. -I./examples -O3 -DNDEBUG -std=c++11 -fPIC -pthread -c utils.cpp -o utils.o
c++ -I. -I./examples -O3 -DNDEBUG -std=c++11 -fPIC -pthread chat.cpp ggml.o utils.o -o chat  -framework Accelerate
c++ -I. -I./examples -O3 -DNDEBUG -std=c++11 -fPIC -pthread quantize.cpp ggml.o utils.o -o quantize  -framework Accelerate
```

