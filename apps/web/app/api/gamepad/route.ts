import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const skin = searchParams.get("s") || "1";

	const response = await fetch(`https://gamepadviewer.com/?p=1&s=${skin}`);
	let html = await response.text();

	const injectScript = `
		<script>
			const fakeGamepad = {
				id: "Xbox 360 Controller (XInput STANDARD GAMEPAD)",
				index: 0,
				connected: true,
				timestamp: performance.now(),
				mapping: "standard",
				axes: [0, 0, 0, 0],
				buttons: Array(17).fill().map(() => ({ pressed: false, touched: false, value: 0 }))
			};

			const originalGetGamepads = navigator.getGamepads;
			navigator.getGamepads = function() {
				const real = originalGetGamepads.call(navigator);
				if (real[0]) return real;
				return [fakeGamepad, null, null, null];
			};

			setTimeout(() => {
				const event = new Event("gamepadconnected");
				event.gamepad = fakeGamepad;
				window.dispatchEvent(event);
			}, 100);
		</script>
	`;

	const injectStyle = `
		<style>
			body { background: transparent !important; }
			.controller {
				filter: brightness(0.15) contrast(1.2);
			}
			.trigger, .bumper {
				filter: sepia(1) saturate(5) hue-rotate(-15deg) brightness(1.2);
			}
			.button.a { filter: sepia(1) saturate(3) hue-rotate(70deg) brightness(1.2); }
			.button.b { filter: sepia(1) saturate(3) hue-rotate(-30deg) brightness(1.1); }
			.button.x { filter: sepia(1) saturate(3) hue-rotate(140deg) brightness(1.2); }
			.button.y { filter: sepia(1) saturate(3) hue-rotate(10deg) brightness(1.3); }
			.stick { filter: sepia(1) saturate(5) hue-rotate(-15deg) brightness(0.9); }
			.face { filter: sepia(1) saturate(5) hue-rotate(-15deg) brightness(1); }
			.back, .start { filter: sepia(1) saturate(3) hue-rotate(-15deg) brightness(0.8); }
			.quadrant { filter: sepia(1) saturate(5) hue-rotate(-15deg); }
		</style>
	`;

	html = html.replace("<head>", "<head>" + injectScript + injectStyle);

	return new NextResponse(html, {
		headers: {
			"Content-Type": "text/html",
		},
	});
}
