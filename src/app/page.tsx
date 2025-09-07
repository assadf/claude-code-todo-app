export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-4xl font-bold text-transparent">
          Claude Code TODO App
        </h1>
        <p className="mb-8 text-gray-400">
          Welcome to your TODO management system
        </p>
        <div className="btn-primary">Get Started</div>
      </div>
    </main>
  );
}
