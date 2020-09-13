#!/usr/bin/env bash

set -e

v v/cmd/v -o v.c

tar cf public/vlib.tar -C v vlib/builtin

clang -w -O3 -D__linux__ \
	-target wasm32-unknown-wasi \
	--sysroot "$wasi_sysroot" \
	-D_WASI_EMULATED_SIGNAL \
	-lwasi-emulated-signal \
	-Iinclude \
	-Wl,--allow-undefined \
	-o public/v.wasm \
	v.c placeholders.c
