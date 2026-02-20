import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

const signUpAppearance = {
  theme: dark,
  variables: {
    fontFamily: 'var(--font-nunito), Nunito, system-ui, sans-serif',
    fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    borderRadius: '1rem',
    colorPrimary: '#27c4e8',
    colorBackground: '#15244d',
    colorForeground: '#ffffff',
    colorInput: '#1e293b',
    colorInputForeground: '#ffffff',
    colorBorder: '#334155',
    colorMuted: '#1e293b',
    colorMutedForeground: '#b1b8c4',
    colorPrimaryForeground: '#0b1534',
    colorRing: '#27c4e8',
    colorShadow: 'transparent',
  },
  elements: {
    rootBox: 'w-full max-w-md',
    card: 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl',
    cardBox: 'rounded-2xl',
    headerTitle: 'text-xl font-bold tracking-tight',
    headerSubtitle: 'text-white/70',
    formFieldLabel: 'font-semibold',
    formFieldInput: 'rounded-xl bg-white/5 border-white/10 text-base',
    formButtonPrimary:
      'rounded-xl font-bold bg-gradient-to-r from-[#27c4e8] to-[#ff8a65] border-0 shadow-lg hover:opacity-90 text-primary-foreground',
    footerActionLink: 'text-[#27c4e8] font-semibold hover:underline',
    identityPreviewEditButton: 'text-white/80',
    dividerLine: 'bg-white/10',
    dividerText: 'text-white/70',
  },
};

export default function Page() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden gradient-navy text-white">
      <div className="p-8 w-full flex justify-center">
        <SignUp appearance={signUpAppearance} />
      </div>
    </div>
  );
}
