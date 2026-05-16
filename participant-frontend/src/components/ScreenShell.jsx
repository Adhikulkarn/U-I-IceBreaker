export default function ScreenShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col">
        {children}
      </div>
    </div>
  );
}
