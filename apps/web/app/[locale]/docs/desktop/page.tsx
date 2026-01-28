import type { Metadata, Viewport } from "next";
import { Header, Prevnext } from "../components";

export const metadata: Metadata = {
	title: "Desktop",
	description: "noro desktop app - coming soon.",
};

export const viewport: Viewport = {
	themeColor: "#0a0a0a",
};

const features = [
	{
		icon: (
			<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
				<path d="M7 11V7a5 5 0 0 1 10 0v4" />
			</svg>
		),
		title: "Password Manager",
		description: "Store and organize all your passwords securely. Encrypted locally with your master password.",
	},
	{
		icon: (
			<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
				<path d="M9 12l2 2 4-4" />
			</svg>
		),
		title: "OTP Authenticator",
		description: "Built-in two-factor authentication. No need for a separate authenticator app.",
	},
	{
		icon: (
			<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
				<path d="M14 2v6h6" />
				<line x1="16" y1="13" x2="8" y2="13" />
				<line x1="16" y1="17" x2="8" y2="17" />
			</svg>
		),
		title: "Encrypted Notes",
		description: "Secure notes for sensitive information like recovery codes, API keys, and credentials.",
	},
	{
		icon: (
			<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<path d="M5 12h14" />
				<path d="M12 5l7 7-7 7" />
			</svg>
		),
		title: "Auto-fill",
		description: "Automatically fill passwords in apps and browsers. Works system-wide.",
	},
	{
		icon: (
			<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
			</svg>
		),
		title: "Biometric Unlock",
		description: "Unlock with Touch ID, Face ID, or Windows Hello. Quick access without typing your master password.",
	},
	{
		icon: (
			<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9" />
			</svg>
		),
		title: "Cloud Sync",
		description: "Optional encrypted sync across all your devices. Your data is encrypted before leaving your device.",
	},
];

const platforms = [
	{
		name: "macOS",
		icon: (
			<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path d="M14.94 5.19A4.38 4.38 0 0 0 16 2a4.44 4.44 0 0 0-3 1.52 4.17 4.17 0 0 0-1 3.09 3.69 3.69 0 0 0 2.94-1.42zm2.52 7.44a4.51 4.51 0 0 1 2.16-3.81 4.66 4.66 0 0 0-3.66-2c-1.56-.16-3 .91-3.83.91-.83 0-2.11-.89-3.47-.86a5.13 5.13 0 0 0-4.29 2.62c-1.83 3.17-.47 7.86 1.31 10.43.87 1.26 1.9 2.67 3.26 2.62 1.31-.05 1.8-.84 3.38-.84 1.58 0 2.03.84 3.41.82 1.41-.03 2.29-1.28 3.15-2.54a10.88 10.88 0 0 0 1.43-2.91 4.38 4.38 0 0 1-2.85-4.44z" />
			</svg>
		),
	},
	{
		name: "Windows",
		icon: (
			<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .15V5.21L20 3zM3 13l6 .09v6.81l-6-1.15V13zm17 .25V22l-10-1.91V13.1l10 .15z" />
			</svg>
		),
	},
	{
		name: "Linux",
		icon: (
			<svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path fill="currentColor" d="M13.338 12.033c-.1-.112-.146-.319-.197-.54-.05-.22-.107-.457-.288-.61v-.001a.756.756 0 00-.223-.134c.252-.745.153-1.487-.1-2.157-.312-.823-.855-1.54-1.27-2.03-.464-.586-.918-1.142-.91-1.963.014-1.254.138-3.579-2.068-3.582-.09 0-.183.004-.28.012-2.466.198-1.812 2.803-1.849 3.675-.045.638-.174 1.14-.613 1.764-.515.613-1.24 1.604-1.584 2.637-.162.487-.24.984-.168 1.454-.023.02-.044.041-.064.063-.151.161-.263.357-.388.489-.116.116-.282.16-.464.225-.183.066-.383.162-.504.395v.001a.702.702 0 00-.077.339c0 .108.016.217.032.322.034.22.068.427.023.567-.144.395-.163.667-.061.865.102.199.31.286.547.335.473.1 1.114.075 1.619.342l.043-.082-.043.082c.54.283 1.089.383 1.526.284a.99.99 0 00.706-.552c.342-.002.717-.146 1.318-.18.408-.032.918.145 1.503.113a.806.806 0 00.068.183l.001.001c.227.455.65.662 1.1.627.45-.036.928-.301 1.315-.762l-.07-.06.07.06c.37-.448.982-.633 1.388-.878.203-.123.368-.276.38-.499.013-.222-.118-.471-.418-.805z" />
				<path fill="rgba(255,255,255,0.4)" d="M13.571 12.828c-.007.137-.107.24-.29.35-.368.222-1.019.414-1.434.918-.362.43-.802.665-1.19.696-.387.03-.721-.13-.919-.526v-.002c-.123-.233-.072-.6.031-.987s.251-.785.271-1.108v-.001c.02-.415.044-.776.114-1.055.07-.28.179-.468.373-.575a.876.876 0 01.027-.014c.022.359.2.725.514.804.343.09.838-.204 1.047-.445l.122-.004c.184-.005.337.006.495.143v.001c.121.102.179.296.229.512.05.217.09.453.239.621.287.32.38.534.371.672zM6.592 13.843v.003c-.034.435-.28.672-.656.758-.377.086-.888 0-1.398-.266-.565-.3-1.237-.27-1.667-.36-.216-.045-.357-.113-.421-.238-.064-.126-.066-.345.071-.72v-.001l.001-.002c.068-.209.018-.438-.015-.653-.033-.214-.049-.41.024-.546l.001-.001c.094-.181.232-.246.403-.307.17-.062.373-.11.533-.27l.001-.001h.001c.148-.157.26-.353.39-.492.11-.117.22-.195.385-.196h.005a.61.61 0 01.093.008c.22.033.411.187.596.437l.533.971v.001c.142.296.441.622.695.954.254.333.45.666.425.921z" />
				<path fill="rgba(255,255,255,0.5)" d="M9.25 4.788c-.043-.084-.13-.164-.28-.225-.31-.133-.444-.142-.617-.254-.28-.181-.513-.244-.706-.244a.834.834 0 00-.272.047c-.236.08-.392.25-.49.342-.02.019-.044.035-.104.08-.06.043-.15.11-.28.208-.117.086-.154.2-.114.332.04.132.167.285.4.417h.001c.145.085.244.2.358.291a.801.801 0 00.189.117c.072.031.156.052.26.058.248.015.43-.06.59-.151.16-.092.296-.204.452-.255h.001c.32-.1.548-.301.62-.493a.324.324 0 00-.008-.27z" />
				<path fill="currentColor" d="M8.438 5.26c-.255.133-.552.294-.869.294-.316 0-.566-.146-.745-.289-.09-.07-.163-.142-.218-.193-.096-.075-.084-.181-.045-.178.066.008.076.095.117.134.056.052.126.12.211.187.17.135.397.266.68.266.284 0 .614-.166.816-.28.115-.064.26-.179.379-.266.09-.067.087-.147.162-.138.075.009.02.089-.085.18-.105.092-.27.214-.403.283z" />
				<path fill="rgba(255,255,255,0.9)" d="M12.337 10.694a1.724 1.724 0 00-.104 0h-.01c.088-.277-.106-.48-.621-.713-.534-.235-.96-.212-1.032.265-.005.025-.009.05-.011.076a.801.801 0 00-.12.054c-.252.137-.389.386-.465.692-.076.305-.098.674-.119 1.09-.013.208-.099.49-.186.79-.875.624-2.09.894-3.122.19-.07-.11-.15-.22-.233-.328a13.85 13.85 0 00-.16-.205.65.65 0 00.268-.05.34.34 0 00.186-.192c.063-.17 0-.408-.202-.68-.201-.273-.542-.58-1.043-.888-.368-.23-.574-.51-.67-.814-.097-.305-.084-.635-.01-.96.143-.625.51-1.233.743-1.614.063-.046.023.086-.236.567-.232.44-.667 1.455-.072 2.248.016-.564.15-1.14.377-1.677.329-.747 1.018-2.041 1.072-3.073.029.02.125.086.169.11.126.075.221.184.344.283a.85.85 0 00.575.2c.24 0 .427-.079.582-.168.17-.096.304-.204.433-.245.27-.085.486-.235.608-.41.21.83.7 2.027 1.014 2.611.167.31.5.969.643 1.762.091-.002.191.01.299.038.375-.973-.319-2.022-.636-2.314-.128-.124-.135-.18-.07-.177.343.304.795.917.96 1.608.075.315.09.646.01.973.04.017.08.034.12.054.603.293.826.548.719.897z" />
				<path fill="rgba(255,255,255,0.5)" d="M8.04 8.062c-.556.002-1.099.251-1.558.716-.46.464-.814 1.122-1.018 1.888l.061.038v.004c.47.298.805.598 1.012.878.219.296.316.584.223.834a.513.513 0 01-.27.283l-.041.015c.074.097.146.197.213.3.944.628 2.042.396 2.867-.172.08-.278.153-.536.163-.698.021-.415.042-.792.124-1.12.082-.33.242-.63.544-.795.017-.01.034-.015.051-.023a.756.756 0 01.022-.094c-.242-.622-.591-1.14-1.01-1.5-.42-.36-.897-.551-1.382-.554zm2.37 2.155l-.002.005v-.002l.001-.004z" />
				<path fill="rgba(255,255,255,0.9)" d="M9.278 3.833a1.05 1.05 0 01-.215.656 4.119 4.119 0 00-.218-.09l-.127-.045c.029-.035.085-.075.107-.127a.669.669 0 00.05-.243l.001-.01a.673.673 0 00-.035-.236.434.434 0 00-.108-.184.223.223 0 00-.156-.07H8.57a.228.228 0 00-.151.06.434.434 0 00-.122.175.676.676 0 00-.05.243v.01a.718.718 0 00.009.14 1.773 1.773 0 00-.354-.12 1.196 1.196 0 01-.01-.133v-.013a1.035 1.035 0 01.088-.447.793.793 0 01.25-.328.554.554 0 01.346-.123h.006c.125 0 .232.036.342.116a.78.78 0 01.257.324c.063.138.094.273.097.433l.001.012zM7.388 3.997a1.05 1.05 0 00-.277.125.623.623 0 00.002-.15v-.008a.651.651 0 00-.048-.192.37.37 0 00-.096-.141.158.158 0 00-.119-.045c-.042.004-.077.024-.11.065a.372.372 0 00-.07.156.626.626 0 00-.013.205v.008a.634.634 0 00.048.193.367.367 0 00.116.156l-.102.08-.078.056a.706.706 0 01-.16-.24c-.053-.12-.082-.24-.09-.381v-.001a1.071 1.071 0 01.045-.39.668.668 0 01.167-.292.359.359 0 01.264-.118c.084 0 .158.028.235.09a.68.68 0 01.199.271c.053.12.08.24.089.382v.001c.003.06.003.115-.002.17z" />
				<path fill="currentColor" d="M7.806 4.335c.01.034.065.029.097.045.027.014.05.045.08.046.03.001.076-.01.08-.04.005-.038-.052-.063-.088-.077-.047-.019-.107-.028-.151-.003-.01.005-.021.018-.018.03zM7.484 4.335c-.01.034-.065.029-.096.045-.028.014-.05.045-.081.046-.03.001-.076-.01-.08-.04-.005-.038.052-.063.088-.077.047-.019.108-.028.152-.003.01.005.02.018.017.03z" />
			</svg>
		),
	},
];

export default function Desktop() {
	return (
		<article className="py-12">
			<Header
				section="Coming Soon"
				title="Desktop"
				description="A secure password manager and secret vault for your desktop."
			/>

			
			<div className="mb-12 p-6 rounded-2xl border border-[#d4b08c]/20 bg-linear-to-br from-[#d4b08c]/5 to-transparent">
				<div className="flex gap-3 items-center mb-3">
					<div className="w-2 h-2 rounded-full bg-[#d4b08c] animate-pulse" />
					<span className="text-sm font-medium text-[#d4b08c]">In Development</span>
				</div>
				<p className="max-w-xl text-sm text-white/60">
					We&apos;re building a native desktop app with full password management, OTP authentication, and seamless sync. Star the repo to get notified when it launches.
				</p>
			</div>

			
			<section id="features" className="mb-12 scroll-mt-20">
				<h2 className="text-xl font-semibold text-[#ededed] mb-6">Planned Features</h2>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{features.map((feature) => (
						<div
							key={feature.title}
							className="p-5 rounded-xl border transition-colors border-white/10 bg-white/2 hover:bg-white/4"
						>
							<div className="w-10 h-10 rounded-lg bg-[#d4b08c]/10 flex items-center justify-center text-[#d4b08c] mb-4">
								{feature.icon}
							</div>
							<h3 className="font-medium text-[#ededed] mb-2">{feature.title}</h3>
							<p className="text-sm leading-relaxed text-white/50">{feature.description}</p>
						</div>
					))}
				</div>
			</section>

			
			<section id="platforms" className="mb-12 scroll-mt-20">
				<h2 className="text-xl font-semibold text-[#ededed] mb-6">Platforms</h2>
				<div className="flex flex-wrap gap-3">
					{platforms.map((platform) => (
						<div
							key={platform.name}
							className="flex gap-3 items-center px-5 py-3 rounded-xl border border-white/10 bg-white/2"
						>
							<span className="text-white/60">{platform.icon}</span>
							<span className="text-sm text-[#ededed]">{platform.name}</span>
						</div>
					))}
				</div>
			</section>

			
			<section id="notify" className="mb-12 scroll-mt-20">
				<div className="p-6 rounded-2xl border border-white/10 bg-white/2">
					<h2 className="text-lg font-semibold text-[#ededed] mb-2">Get Notified</h2>
					<p className="mb-4 text-sm text-white/50">
						Follow the project on GitHub to receive updates when the desktop app is released.
					</p>
					<a
						href="https://github.com/visible/noro"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-[#ededed] transition-colors"
					>
						<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
						</svg>
						Star on GitHub
					</a>
				</div>
			</section>

			<Prevnext />
		</article>
	);
}
