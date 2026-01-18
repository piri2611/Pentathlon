import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase.ts';

type BazarStep = 'form' | 'buzzer' | 'display';

const Bazar = () => {
  const [step, setStep] = useState<BazarStep>(() => {
    const saved = localStorage.getItem('bazarStep');
    return (saved as BazarStep) || 'form';
  });

  const [schoolName, setSchoolName] = useState(() => {
    return localStorage.getItem('schoolName') || '';
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [sessionToken] = useState<string>(() => {
    const existing = localStorage.getItem('bazarSessionToken');
    if (existing) return existing;
    const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    localStorage.setItem('bazarSessionToken', token);
    return token;
  });

  useEffect(() => {
    localStorage.setItem('bazarStep', step);
  }, [step]);

  useEffect(() => {
    localStorage.setItem('schoolName', schoolName);
  }, [schoolName]);

  const handleNext = async () => {
    if (schoolName.trim()) {
      // Save to Supabase
      try {
        const { data: existingSchool, error: fetchError } = await supabase
          .from('schools')
          .select('*, session_token, session_expires')
          .eq('school_name', schoolName.trim())
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching school:', fetchError);
        } else if (existingSchool) {
          // Block if another active session exists for this school
          const expiresAt = existingSchool.session_expires ? new Date(existingSchool.session_expires).getTime() : 0;
          const isActive = !expiresAt || expiresAt > Date.now();
          if (existingSchool.session_token && existingSchool.session_token !== sessionToken && isActive) {
            alert('This school name is already active on another device/tab. Please use a different name or wait until the other session ends.');
            return;
          }

          // School already exists, just update
          const { error } = await supabase
            .from('schools')
            .update({
              login_at: new Date().toISOString(),
              session_token: sessionToken,
              session_expires: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours
            })
            .eq('school_name', schoolName.trim());

          if (error) {
            console.error('Error updating school:', error);
          } else {
            console.log('School updated successfully');
          }
        } else {
          // Enforce max 10 schools total
          const { count, error: countError } = await supabase
            .from('schools')
            .select('id', { count: 'exact', head: true });

          if (countError) {
            console.error('Error counting schools:', countError);
            alert('Could not verify available slots. Please try again.');
            return;
          }

          if (count !== null && count >= 10) {
            alert('Maximum number of schools (10) already registered.');
            return;
          }

          // New school - insert it
          const { error } = await supabase
            .from('schools')
            .insert([{
              school_name: schoolName.trim(),
              login_at: new Date().toISOString(),
              session_token: sessionToken,
              session_expires: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
            }]);

          if (error) {
            console.error('Error inserting school:', error);
          } else {
            console.log('School saved successfully');
          }
        }
      } catch (err) {
        console.error('Failed to save school name:', err);
      }

      setStep('buzzer');
    }
  };

  const handleBuzzerClick = async () => {
    // Create buzzer sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create oscillator for the buzzer tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Configure buzzer sound - harsh, loud tone
      oscillator.type = 'square'; // Square wave for harsh buzzer sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz buzzer frequency
      
      // Envelope for sharp attack and quick decay
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01); // Fast attack
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4); // Quick decay
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Play sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
      
      // Cleanup
      setTimeout(() => {
        audioContext.close();
      }, 500);
    } catch (err) {
      console.error("Audio play error:", err);
    }

    // Save buzzer press to Supabase (no auth)
    try {
      const trimmedName = schoolName.trim();
      if (!trimmedName) {
        console.error('Missing school name for buzzer press');
        return;
      }

      // Ensure this device owns the session for this school
      const { data: schoolRow, error: fetchErr } = await supabase
        .from('schools')
        .select('session_token, session_expires')
        .eq('school_name', trimmedName)
        .single();

      if (fetchErr) {
        console.error('Error validating session:', fetchErr);
        alert('Could not validate session for this school.');
        return;
      }

      const expiresAt = schoolRow?.session_expires ? new Date(schoolRow.session_expires).getTime() : 0;
      const isActive = !expiresAt || expiresAt > Date.now();
      if (!schoolRow || (schoolRow.session_token && schoolRow.session_token !== sessionToken && isActive)) {
        alert('Another device is already using this school name right now.');
        return;
      }

      // Update pressed_at (trigger will auto-increment press_count and set to current time)
      const { error } = await supabase
        .from('schools')
        .update({
          pressed_at: new Date().toISOString() // Trigger will override with NOW()
        })
        .eq('school_name', trimmedName)
        .eq('session_token', sessionToken);

      if (error) {
        console.error('Error updating buzzer press:', error);
      } else {
        console.log('Buzzer pressed successfully');
      }
    } catch (err) {
      console.error('Failed to update buzzer press:', err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (step === 'form') {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <div className="bg-[#1a2332] border border-white/10 w-full max-w-md p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold gradient-text mb-6 text-center">
            Welcome to Bazar
          </h2>
          
          <div className="space-y-6">
            <div>
              <label 
                htmlFor="schoolName" 
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                School Name
              </label>
              <input
                id="schoolName"
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0f1729] border border-white/20 text-white placeholder-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all outline-none"
                placeholder="Enter your school name"
              />
            </div>

            <button
              onClick={handleNext}
              disabled={!schoolName.trim()}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
                schoolName.trim()
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:scale-105 neon-glow'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'buzzer') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0f1729] pt-20">
        <div className="text-center">
          <button
            onClick={handleBuzzerClick}
            className="w-80 h-80 rounded-full transition-all duration-300 cursor-pointer bg-gradient-to-br from-red-400 to-red-600 hover:scale-110 hover:shadow-xl shadow-lg shadow-red-400/30"
            style={{
              boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3)',
              cursor: 'pointer'
            }}
          >
            <span className="text-white text-5xl font-bold">
              BUZZ
            </span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Bazar;
