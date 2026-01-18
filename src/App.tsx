import { useEffect, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import Navbar from './components/Navbar';
import Bazar from './pages/Bazar';
import Display from './pages/Display';
import Login from './pages/Login';
import { supabase } from './lib/supabase.ts';
import './App.css';

type Page = 'bazar' | 'display';

function App() {
  const [activePage, setActivePage] = useState<Page>(() => {
    const saved = localStorage.getItem('activePage');
    return (saved as Page) || 'bazar';
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    localStorage.setItem('activePage', activePage);
  }, [activePage]);

  useEffect(() => {
    const syncSession = async () => {
      // Check if user is already logged in
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      setIsLoggedIn(Boolean(session));
      if (session) {
        setActivePage('display');
      }
    };

    void syncSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((
      _event: AuthChangeEvent,
      session: Session | null
    ) => {
      setIsLoggedIn(Boolean(session));
      if (session) {
        setActivePage('display');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigate = (page: Page) => {
    setActivePage(page);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setActivePage('bazar');
  };

  const isLoginRoute = typeof window !== 'undefined' && window.location.pathname.toLowerCase() === '/login';

  return (
    <div className="min-h-screen bg-[#0f1729]">
      <Navbar activePage={isLoginRoute ? null : activePage} onNavigate={handleNavigate} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="pt-20">
        {isLoginRoute ? (
          <Login onLoginSuccess={() => {
            setIsLoggedIn(true);
            setActivePage('display');
            window.history.pushState({}, '', '/');
          }} />
        ) : (
          <>
            {activePage === 'bazar' && !isLoggedIn && <Bazar onComplete={() => setActivePage('display')} />}
            {(activePage === 'display' || isLoggedIn) && <Display isLoggedIn={isLoggedIn} />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
