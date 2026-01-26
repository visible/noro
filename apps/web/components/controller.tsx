type Props = {
	accent?: string;
	colors?: string[];
};

export function Controller({ accent = "#FF6B00", colors = ["#ef4444", "#22c55e", "#eab308", "#3b82f6"] }: Props) {
	return (
		<svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path
				d="M40 35C40 25 50 20 60 20H140C150 20 160 25 160 35V75C160 95 145 100 130 100H120C110 100 105 95 100 90C95 95 90 100 80 100H70C55 100 40 95 40 75V35Z"
				fill="#1a1a1a"
				stroke="#333"
				strokeWidth="2"
			/>
			<ellipse cx="65" cy="50" rx="18" ry="18" fill="#0f0f0f" stroke="#333" strokeWidth="1.5" />
			<ellipse cx="65" cy="50" rx="12" ry="12" fill="#252525" />
			<circle cx="65" cy="50" r="8" fill={accent} fillOpacity="0.3" />
			<ellipse cx="120" cy="70" rx="18" ry="18" fill="#0f0f0f" stroke="#333" strokeWidth="1.5" />
			<ellipse cx="120" cy="70" rx="12" ry="12" fill="#252525" />
			<circle cx="120" cy="70" r="8" fill={accent} fillOpacity="0.3" />
			<rect x="55" y="65" width="6" height="16" rx="1" fill="#333" />
			<rect x="50" y="71" width="16" height="6" rx="1" fill="#333" />
			<circle cx="145" cy="50" r="7" fill={colors[1]} />
			<circle cx="158" cy="40" r="7" fill={colors[0]} />
			<circle cx="132" cy="40" r="7" fill={colors[3]} />
			<circle cx="145" cy="30" r="7" fill={colors[2]} />
			<text x="145" y="53" textAnchor="middle" fill="#000" fontSize="8" fontWeight="bold">A</text>
			<text x="158" y="43" textAnchor="middle" fill="#000" fontSize="8" fontWeight="bold">B</text>
			<text x="132" y="43" textAnchor="middle" fill="#000" fontSize="8" fontWeight="bold">X</text>
			<text x="145" y="33" textAnchor="middle" fill="#000" fontSize="8" fontWeight="bold">Y</text>
			<rect x="50" y="12" width="30" height="8" rx="4" fill={accent} fillOpacity="0.6" />
			<rect x="120" y="12" width="30" height="8" rx="4" fill={accent} fillOpacity="0.6" />
			<rect x="55" y="5" width="20" height="10" rx="2" fill={accent} fillOpacity="0.4" />
			<rect x="125" y="5" width="20" height="10" rx="2" fill={accent} fillOpacity="0.4" />
			<rect x="88" y="35" width="10" height="6" rx="2" fill="#333" />
			<rect x="102" y="35" width="10" height="6" rx="2" fill="#333" />
			<circle cx="100" cy="50" r="8" fill={accent} fillOpacity="0.2" stroke={accent} strokeWidth="1" />
		</svg>
	);
}
