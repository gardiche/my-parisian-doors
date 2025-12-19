// Updated tailwind.config.ts with Parisian color palette
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				// Parisian Color Palette
				border: '#E5E3DF',
				input: '#E5E3DF',
				ring: '#2E4A62',
				background: '#FAF7F2',
				foreground: '#1C1C1C',
				primary: {
					DEFAULT: '#2E4A62', // Haussmann Blue
					foreground: '#FAF7F2'
				},
				secondary: {
					DEFAULT: '#9BBFA2', // Sage Green
					foreground: '#1C1C1C'
				},
				destructive: {
					DEFAULT: '#A6473C', // Brick Red
					foreground: '#FAF7F2'
				},
				muted: {
					DEFAULT: '#E5E3DF', // Stone Grey
					foreground: '#555555'
				},
				accent: {
					DEFAULT: '#D9A441', // Ochre Yellow
					foreground: '#1C1C1C'
				},
				popover: {
					DEFAULT: '#FAF7F2',
					foreground: '#1C1C1C'
				},
				card: {
					DEFAULT: '#E5E3DF', // Stone Grey
					foreground: '#1C1C1C'
				},
				// Custom Parisian colors
				haussmann: '#2E4A62',
				sage: '#9BBFA2',
				stone: '#E5E3DF',
				brick: '#A6473C',
				ochre: '#D9A441',
				charcoal: '#555555',
				cream: '#FAF7F2',
				night: '#1C1C1C',
			},
			borderRadius: {
				lg: '16px', // Large rounded corners
				md: '12px',
				sm: '8px'
			},
			boxShadow: {
				'parisian': '0 4px 16px rgba(28, 28, 28, 0.08)',
				'parisian-lg': '0 8px 32px rgba(28, 28, 28, 0.12)',
				'parisian-xl': '0 12px 48px rgba(28, 28, 28, 0.15)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					from: {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'heartBeat': {
					'0%': {
						transform: 'scale(1)'
					},
					'25%': {
						transform: 'scale(1.3)'
					},
					'50%': {
						transform: 'scale(1.1)'
					},
					'75%': {
						transform: 'scale(1.25)'
					},
					'100%': {
						transform: 'scale(1)'
					}
				},
				'scale-up': {
					'0%': {
						transform: 'scale(0.8)',
						opacity: '0'
					},
					'50%': {
						transform: 'scale(1.2)',
						opacity: '1'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'heartBreak': {
					'0%': {
						transform: 'scale(1)',
						opacity: '1'
					},
					'50%': {
						transform: 'scale(1.2) rotate(5deg)',
						opacity: '0.5'
					},
					'100%': {
						transform: 'scale(0.8)',
						opacity: '0'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1'
					},
					'100%': {
						opacity: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'heartBeat': 'heartBeat 0.6s ease-in-out',
				'scale-up': 'scale-up 0.3s ease-out',
				'heartBreak': 'heartBreak 0.4s ease-out',
				'fade-out': 'fade-out 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;