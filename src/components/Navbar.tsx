interface NavbarProps {
  activePage: 'bazar' | 'display' | null;
  onNavigate: (page: 'bazar' | 'display') => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const Navbar = ({ activePage, onNavigate, isLoggedIn = false, onLogout }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f1729] border-b border-white/10">
      <div className="w-full px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section - Fixed at left */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold text-white whitespace-nowrap">Pentathlon</span>
          </div>

          {/* Center Navigation Links */}
          <div className="flex items-center gap-12 absolute left-1/2 transform -translate-x-1/2">
            {!isLoggedIn && (
              <button
                onClick={() => onNavigate('bazar')}
                className={`text-lg font-medium transition-all duration-300 pb-2 border-b-2 ${
                  activePage === 'bazar'
                    ? 'text-cyan-400 border-cyan-400'
                    : 'text-gray-300 hover:text-white border-b-2 border-transparent'
                }`}
              >
                Bazar
              </button>
            )}

            {!isLoggedIn && <div className="w-px h-6 bg-white/20"></div>}

            <button
              onClick={() => onNavigate('display')}
              className={`text-lg font-medium transition-all duration-300 pb-2 border-b-2 ${
                activePage === 'display'
                  ? 'text-cyan-400 border-cyan-400'
                  : 'text-gray-300 hover:text-white border-b-2 border-transparent'
              }`}
            >
              Display
            </button>
          </div>

          {/* Right Side - Logout Button */}
          {isLoggedIn && onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-500 transition-all font-medium"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
