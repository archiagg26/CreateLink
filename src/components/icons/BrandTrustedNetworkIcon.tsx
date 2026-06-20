interface IconProps {
    size?: number;
    color?: string;
    accentColor?: string;
}

export default function BrandTrustedNetworkIcon({
    size = 34,
    color = '#1F1F1F',
    accentColor = '#A8678A',
}: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M28 10V18M10 28H18M46 28H38M28 46V38"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
            />

            <path
                d="M28 18L30.1 21.3L33.9 22L31.1 24.6L31.8 28.5L28 26.5L24.2 28.5L24.9 24.6L22.1 22L25.9 21.3L28 18Z"
                fill={accentColor}
                stroke={accentColor}
                strokeWidth="1.5"
            />

            <path
                d="M28 30V46"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}