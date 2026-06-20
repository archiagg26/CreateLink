interface IconProps {
    size?: number;
    color?: string;
    accentColor?: string;
}

export default function CreatorSparkGrowthIcon({
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
                d="M28 6C15.8 6 6 15.8 6 28C6 40.2 15.8 50 28 50C40.2 50 50 40.2 50 28C50 15.8 40.2 6 28 6Z"
                stroke={color}
                strokeWidth="2"
            />

            <path
                d="M18 36C22 32 24 30 26 28C28 26 30 28 32 30C34 32 36 28 38 24"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M28 20L30.1 23.3L33.9 24L31.1 26.6L31.8 30.5L28 28.5L24.2 30.5L24.9 26.6L22.1 24L25.9 23.3L28 20Z"
                stroke={accentColor}
                strokeWidth="2"
                strokeLinejoin="round"
            />
        </svg>
    );
}