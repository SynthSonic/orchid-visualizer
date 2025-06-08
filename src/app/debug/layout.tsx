export const metadata = {
  title: "Orchid Debug",
};

export const viewport = {
  themeColor: "#222222",
};

export default function DebugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
