import {WASI} from "https://jspm.dev/@wasmer/wasi@0.11.2"
import bindings from "https://jspm.dev/@wasmer/wasi@0.11.2/lib/bindings/browser"
import {WasmFs} from "https://jspm.dev/@wasmer/wasmfs@0.11.2"
import path from "https://jspm.dev/@jspm/core@2/nodelibs/path"
import {PassThrough} from "https://jspm.dev/@jspm/core@2/nodelibs/stream"
import fsn from "https://jspm.dev/@jspm/core@2/nodelibs/fs"
import {lowerI64Imports, wasmTransformerInit} from "https://unpkg.com/@wasmer/wasm-transformer@0.11.2/lib/optimized/wasm-transformer.esm.js"
import Import from "https://jspm.dev/dynamic-import-polyfill@0.1.1"

Import.initialize()

let editor = document.querySelector("#editor")
let output = document.querySelector("#output")

let play = document.querySelector("#play")
let stop = document.querySelector("#stop")

let ids = []
let listeners = []

let lib =
{
	console:
	{
		log: value => output.append(String(value), "\n"),
		clear: () => output.textContent = "",
	},
	setInterval: (f, ms, ...args) =>
	{
		play.disabled = true
		stop.disabled = false
		ids.push(setInterval(f, ms, ...args))
	},
	addEventListener: (type, listener, ...options) =>
	{
		play.disabled = true
		stop.disabled = false
		listeners.push([type, listener])
		addEventListener(type, listener, ...options)
	},
}

let libKeys = Object.keys(lib)
let libValues = libKeys.map(key => lib[key])

stop.addEventListener("click", () =>
{
	for (let id of ids) clearInterval(id)
	for (let [type, listener] of listeners) removeEventListener(type, listener)
	ids = []
	listeners = []
	play.disabled = false
	stop.disabled = true
})

let createProxy = () => new Proxy({},
{
	get: (object, key) =>
	{
		if (typeof key === "symbol" || key in object) return object[key]
		return (...args) => { throw new Error(`${key} was called as a (${args.join(", ")})`) }
	},
})

let main = async () =>
{
	fsn.constants = {}
	
	let tar = (await __import__("https://jspm.dev/tar@6.0.5")).default
	
	let vlib = new Uint8Array(await (await fetch("vlib.tar")).arrayBuffer())
	
	await wasmTransformerInit("https://unpkg.com/@wasmer/wasm-transformer@0.11.2/lib/wasm-pack/web/wasm_transformer_bg.wasm")
	
	let module = await WebAssembly.compile(await lowerI64Imports(new Uint8Array(await (await fetch("v.wasm")).arrayBuffer())))
	
	play.disabled = false
	
	play.addEventListener("click", async () =>
	{
		output.textContent = ""
		
		let {fs} = new WasmFs()
		fs.writeFileSync("/v", "v")
		fs.mkdirSync("/proc/self", {recursive: true})
		fs.symlinkSync("/v", "/proc/self/exe")
		
		path.win32 = path
		Object.assign(fsn, fs)
		
		let stream = new PassThrough()
		stream.pipe(tar.extract({sync: true, cwd: "/"}))
		stream.end(vlib)
		
		let success = true
		
		let wasi = new WASI(
		{
			args: ["v", "-b", "js", "-nocolor", "main.v"],
			bindings:
			{
				...bindings,
				fs, path,
				hrtime: () => 0,
				exit: status => status && (success = false),
			},
			preopens:  {"/": "/", ".": "/"},
		})
		
		fs.writeFileSync("/main.js", "")
		fs.writeFileSync("/main.v", editor.textContent)
		
		play.disabled = true
		
		let instance = await WebAssembly.instantiate(module, {...wasi.getImports(module), env: createProxy()})
		let {exports: {memory}} = instance
		
		play.disabled = false
		
		let appendError = error =>
		{
			output.append("\n")
			if (error instanceof Error) output.append(error.stack)
			else output.append(String(error))
		}
		
		try { wasi.start(instance) }
		catch (error) { /* appendError(error) */ ; success = false }
		
		if (success)
		{
			try { Function(...libKeys, fs.readFileSync("main.js", "utf-8"))(...libValues) }
			catch (error) { appendError(error) }
		}
		else
		{
			output.append("\n", fs.readFileSync(2, "utf-8"))
		}
	})
}

main()
