import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ArrowLeft, Video, Users, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export function LiveClassroom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [joining, setJoining] = useState(true);

  // 1. Load the Jitsi External API script dynamically
  useEffect(() => {
    const scriptId = 'jitsi-external-api';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      document.body.appendChild(script);
    }

    const onScriptLoad = () => {
      setJitsiLoaded(true);
    };

    script.addEventListener('load', onScriptLoad);

    if ((window as any).JitsiMeetExternalAPI) {
      setJitsiLoaded(true);
    }

    return () => {
      script.removeEventListener('load', onScriptLoad);
    };
  }, []);

  // 2. Initialize Jitsi Meet Interface
  useEffect(() => {
    if (!jitsiLoaded || !jitsiContainerRef.current || !id || !user) return;

    // Generate web-safe unique room string based on ID
    const roomName = `ScholarHub_LiveSession_${id.replace(/[^a-zA-Z0-9]/g, '')}`;
    const domain = 'meet.jit.si';
    
    // Role-based Configs: Teachers/Admins have moderation-like configs
    const isModerator = user.role === 'teacher' || user.role === 'admin';

    const options = {
      roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: user.name || user.email?.split('@')[0] || 'Student',
        email: user.email || '',
      },
      configOverwrite: {
        // Students start muted, teachers start unmuted
        startWithAudioMuted: !isModerator,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true, // Prevent prompting mobile app download in iframe
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        // Interface Customization: Core buttons only, removing external links & help
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'chat', 'raisehand', 
          'tileview', 'videoquality'
        ],
      }
    };

    try {
      const api = new (window as any).JitsiMeetExternalAPI(domain, options);
      jitsiApiRef.current = api;

      api.addEventListener('videoConferenceJoined', () => {
        setJoining(false);
      });

      api.addEventListener('videoConferenceLeft', () => {
        handleLeave();
      });

    } catch (err) {
      console.error('Failed to initialize Jitsi:', err);
      toast.error('Failed to connect to video server.');
      setJoining(false);
    }

    // 3. Lifecycle & Cleanup
    return () => {
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (e) {
          console.error('Error disposing Jitsi API:', e);
        }
        jitsiApiRef.current = null;
      }
    };
  }, [jitsiLoaded, id, user]);

  const handleLeave = () => {
    navigate('/courses');
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-neutral-50 dark:bg-neutral-950 overflow-hidden font-sans">
      {/* Interactive Sidebar - 25% Width */}
      <div className="w-full lg:w-1/4 h-auto lg:h-full flex flex-col border-r border-outline-variant/15 bg-white dark:bg-neutral-900 z-10 shrink-0 shadow-lg">
        <div className="p-6 flex-1 flex flex-col">
          
          <button 
            onClick={handleLeave}
            className="flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors w-fit mb-8"
          >
            <ArrowLeft size={16} />
            Back to Courses
          </button>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-serif text-neutral-900 dark:text-white mb-1">
              Live Classroom
            </h2>
            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Session ID: {id}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-neutral-100/50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3 mb-2 text-neutral-900 dark:text-white font-semibold">
                <Info size={18} className="text-purple-500" />
                Class Protocol
              </div>
              <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2 list-disc list-inside">
                <li>Keep microphone muted when not speaking</li>
                <li>Use 'Raise Hand' to ask questions</li>
                <li>Maintain a respectful learning environment</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20">
              <div className="flex items-center gap-3 mb-1 text-purple-900 dark:text-purple-100 font-semibold">
                <Users size={18} />
                User Info
              </div>
              <p className="text-sm text-purple-800/80 dark:text-purple-200/80">
                Logged in as <strong>{user?.name || user?.email?.split('@')[0]}</strong>. You are recognized as a <strong>{user?.role}</strong> in this session.
              </p>
            </div>
          </div>
          
          <div className="mt-auto pt-6 border-t border-outline-variant/10 text-center">
            <p className="text-xs font-medium text-neutral-400 flex items-center justify-center gap-1">
              <Video size={14} /> Powered by Jitsi Meet
            </p>
          </div>
        </div>
      </div>

      {/* Video Stage - 75% Width */}
      <div className="w-full lg:w-3/4 h-[60vh] lg:h-full relative bg-[#1c1c1c] flex-1 flex flex-col">
        {joining && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#151515] text-white z-20">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
            <p className="text-base font-medium tracking-wide font-serif text-purple-100">Connecting to secure classroom...</p>
          </div>
        )}
        <div ref={jitsiContainerRef} className="w-full h-full flex-1" />
      </div>
    </div>
  );
}
