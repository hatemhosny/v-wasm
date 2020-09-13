~~~ Bash
git clone https://github.com/zamfofex/v-wasm
cd v-wasm
git submodule update --init --remote v
# Needs V, Clang, and WASI sysroot pre‐installed.
# (Replace the ‘/wasi-sysroot’ path appropriately.)
wasi_sysroot=/wasi-sysroot ./build.bash
cd public
python3 -m http.server
~~~

Note: Your V version roughly needs to match the version of the `v` submodule. In the instructions above, I update the submodule to latest, but you can feel free to do something else.

license — zero‐clause BSD (0BSD)
---

Copyright © 2020 by Zamfofex

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED “AS IS” AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
