import { useAuth } from "@workspace/replit-auth-web";

export default function SignIn() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 10L19 6M19 6L15 2M19 6H9C6.79086 6 5 7.79086 5 10V18C5 20.2091 6.79086 22 9 22H19" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-left">
              <span className="text-white font-bold text-2xl">Smallbiz</span>
              <span className="text-green-400 font-bold text-2xl">Portal</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-white text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-zinc-400 text-sm mb-8">
            Sign in to access your marketing dashboard, content calendar, and analytics.
          </p>

          <button
            onClick={login}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-3 px-6 rounded-xl transition-colors duration-150 flex items-center justify-center gap-2 text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M4 20C4 17.7909 7.58172 16 12 16C16.4183 16 20 17.7909 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Sign in to your account
          </button>

          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-green-400 font-bold text-lg">📅</div>
                <div className="text-zinc-500 text-xs mt-1">Content Calendar</div>
              </div>
              <div>
                <div className="text-green-400 font-bold text-lg">✅</div>
                <div className="text-zinc-500 text-xs mt-1">Approvals</div>
              </div>
              <div>
                <div className="text-green-400 font-bold text-lg">📊</div>
                <div className="text-zinc-500 text-xs mt-1">Analytics</div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-zinc-600 text-xs mt-6">
          Your data is private and only visible to your account.
        </p>
      </div>
    </div>
  );
}
