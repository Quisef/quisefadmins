'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Video Player Component
interface VideoPlayerProps {
  src: string;
  poster: string;
  title: string;
}

function VideoPlayer({ src, poster, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Lazy load video with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Video event handlers
  const handleCanPlay = () => setIsLoading(false);
  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };
  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  // Play/Pause with proper error handling
  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Video playback error:', error);
      setIsPlaying(false);
    }
  };

  // Seek video
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percentage = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percentage * duration;
    }
  };

  // Volume and mute controls
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      if (!isVisible) return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          await togglePlayPause();
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'ArrowLeft':
          if (videoRef.current) videoRef.current.currentTime -= 10;
          break;
        case 'ArrowRight':
          if (videoRef.current) videoRef.current.currentTime += 10;
          break;
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isVisible, isPlaying]);

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div
        className={`relative aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900 ${
          isFullscreen ? 'rounded-none' : ''
        }`}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={poster}
          onCanPlay={handleCanPlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          playsInline
          preload="auto"
          aria-label={title}
        >
          <source src={src} type="videos/.mp4" />
          Your browser does not support the video tag.
        </video>

        {isLoading && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <button
              onClick={togglePlayPause}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transition-transform hover:scale-110"
              aria-label="Play video"
            >
              <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        )}

        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 transition-opacity duration-300 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            ref={progressRef}
            className="w-full h-2 bg-gray-600 rounded-full mb-4 cursor-pointer"
            onClick={handleSeek}
            role="slider"
            aria-label="Video progress"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
          >
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlayPause}
                className="hover:text-blue-400 transition-colors"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="hover:text-blue-400 transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-gray-600 rounded-lg cursor-pointer accent-blue-500"
                  aria-label="Volume control"
                />
              </div>

              <div className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <button
              onClick={toggleFullscreen}
              className="hover:text-blue-400 transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center mt-4 px-4">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">{title}</h3>
        
      </div>
    </div>
  );
}

type TeamMember = {
  name: string;
  role: string;
  image: string;
  bio: string;
};

export default function AboutPage() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const teamMembers: TeamMember[] = [
    {
      name: 'Mr Goodness Chama',
      role: 'Executive Chairman',
      image: '/images/Goodness.jpg',
      bio: 'Goodness Chama leads with a vision for community empowerment and sustainable change.',
    },
    {
      name: 'Mrs Rebecca Ojochoko',
      role: 'Board Member',
      image: '/images/Rebecca.jpg',
      bio: 'Rebecca brings extensive experience in community development to the board.',
    },
    {
      name: 'Mr Jean Paul Cleron',
      role: 'Board Member',
      image: '/images/Cleron.jpg',
      bio: 'Jean Paul contributes global expertise in humanitarian efforts.',
    },
    {
      name: 'Mrs Wadiam Goodness',
      role: 'Executive Director',
      image: '/images/Chama.jpg',
      bio: 'Wadiam oversees operations with a passion for uptake the vulnerable.',
    },
    {
      name: 'Mr Wisdom Anuhu',
      role: 'Board Member',
      image: '/images/wisdom.jpg',
      bio: 'Wisdom provides strategic insights for organizational growth.',
    },
    {
      name: 'Mrs Victoria Ezenduka',
      role: 'Board Member',
      image: '/images/Vicky.jpg',
      bio: 'Victoria advocates for education and empowerment initiatives.',
    },
    {
      name: 'Mrs Esther Emmanuel',
      role: 'Board Member',
      image: '/images/ojo.jpg',
      bio: 'Esther focuses on fostering partnerships for impactful programs.',
    },
  ];

  // Modal escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedMember(null);
    };
    if (selectedMember) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedMember]);

  return (
    <main className="bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center text-white px-6 text-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/smile.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="container mx-auto max-w-4xl relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 leading-tight tracking-tight">
            Our Story
          </h1>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 md:py-16 px-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-black bg-clip-text text-transparent leading-tight">
                Protecting a Child at Every Step
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700 text-lg leading-relaxed">
                The Quiet Shelter Empowerment Foundation is a registered not-for-profit organization
                established in August 2020 in Jimeta, Yola, Adamawa State, Nigeria.
              </p>
              <p className="text-gray-600 text-base leading-relaxed">
                Our primary purpose is to provide humanitarian services to communities, aiming to bring 
                about positive changes and developments that create lasting impact for vulnerable children 
                and families.
              </p>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                  <span className="text-blue-600 text-xs font-semibold">100+</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center">
                  <span className="text-blue-600 text-xs font-semibold">Lives</span>
                </div>
              </div>
              <span className="text-sm text-gray-500">Children protected since 2020</span>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-[100px_20px_20px_20px] opacity-20 group-hover:opacity-30 transition-all duration-500 blur-xl"></div>
              <div className="relative h-72 sm:h-80 lg:h-96 w-full rounded-[90px_10px_10px_10px] overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                <Image
                  src="/images/goodnesschama.jpg"
                  alt="Executive Director - Championing child protection and community empowerment"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Floating badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-xs font-semibold text-blue-600">Est. 2020</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* History Section */}
      <section className="py-12 md:py-16 px-6 bg-gray-100">
        <div className="container mx-auto max-w-5xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center">Our History</h2>
          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
            Founded in August 2020 amidst the challenges of a global pandemic, QuietShelter
            Empowerment Foundation emerged from a deep commitment to support vulnerable children and
            families in Nigeria. Starting in Jimeta, Yola, we began with small-scale initiatives to
            provide shelter and basic needs, quickly growing into a recognized organization dedicated
            to sustainable community development. Over the years, we've expanded our reach, partnering
            with local and international stakeholders to address pressing issues like education,
            sanitation, and gender equity, all while staying true to our roots of compassion and
            action.
          </p>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 md:py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              See Our Impact in Action
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-3xl mx-auto">
              Watch how QuietShelter Empowerment Foundation is making a difference in communities
              across Nigeria through our dedicated programs and initiatives.
            </p>
          </div>
          <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-xl overflow-hidden shadow-lg">
            <iframe
              className="w-full h-full"
              src="https://go.screenpal.com/player/cTjIfOn2Qhg?width=100%&height=100%&ff=1&title=0"
              title="QuietShelter Foundation Impact Story"
              style={{ border: 0 }}
              scrolling="no"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* Aims and Objectives Section */}
      <section className="py-12 md:py-16 px-6 bg-gray-100">
        <div className="container mx-auto max-w-5xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center">
            Aims and Objectives
          </h2>
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
            <ul className="list-disc list-inside text-gray-700 text-base md:text-lg leading-relaxed space-y-4">
              <li>
                <strong>Provide Shelter, Psychosocial Support, and Education (SPE):</strong> Deliver
                comprehensive support to homeless and vulnerable children, ensuring their safety,
                mental well-being, and access to learning opportunities.
              </li>
              <li>
                <strong>Enhance Health and Socio-Economic Well-Being:</strong> Improve community health
                through public health enlightenment, health education, Sexual and Reproductive Health
                and Rights (SRHR), Gender-Based Violence (GBV) prevention, and Water, Sanitation, and
                Hygiene (WASH) initiatives.
              </li>
              <li>
                <strong>Promote Gender Equality:</strong> Advocate for the rights of women, youth,
                children, and other vulnerable populations to foster equity at all societal levels.
              </li>
              <li>
                <strong>Empower Through Skills:</strong> Equip individuals and communities with skill
                acquisition training to enhance self-reliance and economic opportunities.
              </li>
              <li>
                <strong>Sustainable Livelihoods:</strong> Promote modern social and agricultural
                practices to ensure long-term economic and environmental sustainability.
              </li>
              <li>
                <strong>Secure Sustainable Funding:</strong> Identify and develop funding sources to
                support victims of natural disasters, insurgency, terrorism, crises, and health
                emergencies.
              </li>
              <li>
                <strong>Boost Entrepreneurial Skills:</strong> Enhance the knowledge, skills, and
                competencies of potential and existing entrepreneurs to promote sustainable
                livelihoods.
              </li>
              <li>
                <strong>Support Referrals:</strong> Connect victims of social and environmental hazards
                and their families to appropriate support agencies or organizations.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 md:py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12 md:mb-16">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="relative w-full max-w-[300px] h-[400px] cursor-pointer group"
                onClick={() => setSelectedMember(member)}
              >
                <div className="absolute inset-0 z-10 transition-transform duration-500 group-hover:-translate-x-14 group-hover:-translate-y-14">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="300px"
                    style={{ objectFit: 'cover' }}
                    className="rounded-[40px]"
                  />
                </div>
                <div className="absolute inset-0 bg-white flex justify-center items-end text-center p-6 z-0 transition-transform duration-500 group-hover:translate-x-14 group-hover:translate-y-14 rounded-[40px] shadow-md">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 leading-tight">
                      {member.name}
                    </h3>
                    <span className="text-gray-500 text-sm">{member.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-12 md:py-16 px-6 bg-gray-100">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12 md:mb-16">
            Our Impact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { count: 2, label: 'Projects', href: '/projects' },
              { count: 5, label: 'Partners' },
              { count: 30, label: 'Volunteers' },
              { count: 1, label: 'Awards' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center bg-white h-32 w-32 sm:h-40 sm:w-40 rounded-full shadow-md hover:shadow-xl transition-shadow duration-300 mx-auto"
              >
                <span className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                  {item.count}
                </span>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-gray-600 text-sm sm:text-base hover:text-blue-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <p className="text-gray-600 text-sm sm:text-base">{item.label}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Member Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white p-6 sm:p-8 rounded-xl max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="text-center space-y-4">
              <div className="relative h-32 w-32 mx-auto rounded-full overflow-hidden">
                <Image
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  fill
                  sizes="128px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">{selectedMember.name}</h3>
              <p className="text-gray-600 text-sm">{selectedMember.role}</p>
              <p className="text-gray-700 text-base">{selectedMember.bio}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}