fn JS.console.log(out any)
fn println(out any) { JS.console.log(out) }

fn fib(a int, b int)
{
	val := a + b
	println(val)
	if val < 1000
	{
		fib(b, val)
	}
}

fib(0, 1)
