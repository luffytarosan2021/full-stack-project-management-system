// The brand name shown in the sidebar and auth pages.
// Matches the Stitch reference screenshots ("HamroProject") but keeps the app fully functional.
export const APP_NAME = "HamroProject";

// Small green dot icon used in sidebar branding
export function BrandDot({ className = "size-2 rounded-full bg-green-400 shrink-0" }) {
  return <span className={className} aria-hidden="true" />;
}

export function AppName({ className }) {
  return (
    <span className={className}>
      <BrandDot />
      <span className="truncate font-semibold tracking-tight">{APP_NAME}</span>
    </span>
  );
}
