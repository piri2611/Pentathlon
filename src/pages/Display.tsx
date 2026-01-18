import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.ts';

interface School {
  id: number;
  school_name: string;
  pressed_at: string;
  created_at: string;
}

interface DisplayProps {
  isLoggedIn?: boolean;
}

const Display = ({ isLoggedIn = false }: DisplayProps) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch leaderboard data
  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('id, school_name, pressed_at, created_at')
        .not('pressed_at', 'is', null)
        .order('pressed_at', { ascending: true })
        .limit(100); // Limit to 100 records for faster load

      if (error) {
        console.error('Error fetching schools:', error);
      } else {
        setSchools(data || []);
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to fetch schools:', err);
      setLoading(false);
    }
  };

  const handleResetBuzzer = async () => {
    if (!confirm('Are you sure you want to reset all buzzer data? This will clear press times and counts.')) {
      return;
    }
    
    setResetting(true);
    try {
      const { error } = await supabase
        .from('schools')
        .update({ pressed_at: null, press_count: 0 })
        .gte('id', 0); // Update all rows (id >= 0)
      
      if (error) throw error;
      
      // Refresh the display
      fetchSchools();
      alert('Buzzer data reset successfully!');
    } catch (error) {
      console.error('Error resetting buzzer data:', error);
      alert('Failed to reset buzzer data');
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL school data! Are you absolutely sure?')) {
      return;
    }
    
    if (!confirm('This action cannot be undone. Type DELETE to confirm.')) {
      return;
    }
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .gte('id', 0); // Delete all rows (id >= 0)
      
      if (error) throw error;
      
      setSchools([]);
      alert('All school data deleted successfully!');
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Failed to delete school data');
    } finally {
      setDeleting(false);
    }
  };

  // Medal colors and icons
  const getMedalColor = (position: number) => {
    switch(position) {
      case 1: return 'from-yellow-400 to-yellow-600'; // Gold
      case 2: return 'from-gray-300 to-gray-500'; // Silver
      case 3: return 'from-orange-400 to-orange-600'; // Bronze
      default: return 'from-blue-500 to-blue-700';
    }
  };

  const getMedalEmoji = (position: number) => {
    switch(position) {
      case 1: return '🏆';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🎖️';
    }
  };

  const getPositionText = (position: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    return position + (suffixes[position % 10] || 'th');
  };

  useEffect(() => {
    fetchSchools();

    // Subscribe to real-time updates ONLY (no polling)
    const subscription = supabase
      .channel('schools-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schools' },
        () => {
          // Refetch on any change
          fetchSchools();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] p-6 md:p-12 flex items-center justify-center">
        <p className="text-white text-lg">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0f1729] p-6 md:p-12 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-white text-center mb-12 italic">
          Who Buzzed First?
        </h1>

        {schools.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-300 text-lg">No schools have pressed the buzzer yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schools.map((school, index) => {
              const position = index + 1;
              const medalColor = getMedalColor(position);
              const medalEmoji = getMedalEmoji(position);
              const positionText = getPositionText(position);

              return (
                <div
                  key={school.id}
                  className={`relative bg-gradient-to-r ${medalColor} p-0.5 rounded-lg transition-all duration-300 hover:scale-105 group`}
                >
                  <div className="bg-[#1a2332] p-6 rounded-lg flex items-center justify-between">
                    {/* Position Badge */}
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${medalColor} shadow-lg`}>
                        <div className="text-3xl">{medalEmoji}</div>
                      </div>
                      
                      <div>
                        <div className={`text-3xl font-bold bg-gradient-to-r ${medalColor} bg-clip-text text-transparent`}>
                          {position}
                          <span className="text-lg text-gray-400">
                            {positionText.replace(position.toString(), '')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* School Name */}
                    <div className="text-right">
                      <h3 className="text-2xl md:text-3xl font-bold text-white">
                        {school.school_name}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {new Date(school.pressed_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin Controls - Only visible when logged in */}
      {isLoggedIn && (
        <div className="max-w-6xl mx-auto px-6 pb-12">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Admin Controls</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Reset Buzzer Card */}
            <div className="bg-[#1a2332] border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔄</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Reset Buzzer Data</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Clear all buzzer press times and reset press counts to zero. School names will remain in the database. Use this to start a new round while keeping registered schools.
                  </p>
                </div>
              </div>
              <button
                onClick={handleResetBuzzer}
                disabled={resetting}
                className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 bg-gradient-to-r from-yellow-500 to-orange-600 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetting ? 'Resetting...' : 'Reset Buzzer Data'}
              </button>
            </div>

            {/* Delete All Data Card */}
            <div className="bg-[#1a2332] border border-red-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-red-400 mb-2">Delete All Schools</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    <span className="text-red-400 font-semibold">DANGER:</span> Permanently delete all school records from the database. This action cannot be undone. Use this to completely clear the system and start fresh.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDeleteAll}
                disabled={deleting}
                className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 bg-gradient-to-r from-red-500 to-red-700 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete All Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Display;
