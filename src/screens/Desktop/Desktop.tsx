import React, { useState, useRef, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { MatrixBackground } from "../../components/MatrixBackground";
import { WaitlistForm } from "../../components/WaitlistForm";
import { ChatBox } from "../../components/ChatBox";
import { Volume2, VolumeX, Github, Linkedin } from "lucide-react";
import { trackVideoInteraction, trackSectionView, initializeAnalytics, trackEvent } from "../../lib/analytics";
import { useApp } from "../../contexts/AppContext";
import { Navbar } from "../../components/Navbar";

export const Desktop = (): JSX.Element => {
  const [isMuted, setIsMuted] = useState(false); // Start unmuted
  const videoRef = useRef<HTMLVideoElement>(null);
  const { appMode, setAppMode, user } = useApp();

  // Initialize analytics on component mount
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeAnalytics()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  // Try to play video with sound on component mount
  useEffect(() => {
    const playVideoWithSound = async () => {
      if (videoRef.current) {
        try {
          videoRef.current.muted = false;
          await videoRef.current.play();
          setIsMuted(false);
        } catch (error) {
          // If autoplay with sound fails, fallback to muted autoplay
          console.log("Autoplay with sound blocked, falling back to muted");
          videoRef.current.muted = true;
          setIsMuted(true);
          try {
            await videoRef.current.play();
          } catch (mutedError) {
            console.log("Muted autoplay also failed");
          }
        }
      }
    };

    playVideoWithSound();
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      trackVideoInteraction(videoRef.current.muted ? 'mute' : 'unmute');
    }
  };

  // Custom X (Twitter) icon component
  const XIcon = ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );

  // Feature card data for mapping - now with different images
  const featureCards = [
    {
      id: 1,
      title: "Legal Paper work",
      description:
        "Boring but necessary. Based Sigma will handle it all for you.",
      image: "legalPaper.svg", // You can change this to any image path
    },
    {
      id: 2,
      title: "Branding",
      description:
        "Brand that doesn't look like Canva threw up",
      image: "/branding.svg", // You can change this to a different image
    },
    {
      id: 3,
      title: "Website",
      description:
        "Website that converts (not just exists), brings all the Sigma to your backyard",
      image: "/website.svg", // You can change this to another different image
    },
    {
      id: 4,
      title: "Payment Processing",
      description:
        "Payment processing that WORKS",
      image: "/payment.svg", // You can change this to another different image
    },
      {
      id: 5,
      title: "Business Banking",
      description:
        "Skip the bank small talk and get your business running",
      image: "/businessBanking.svg", // You can change this to another different image
    },
      {
      id: 6,
      title: "Marketing",
      description:
        "Marketing that runs itself, promoting your business is now a piece of cake",
      image: "/sigmaguy.svg", // You can change this to another different image
    },
  ];

  // Team members data - now with optional social links
  const teamMembers = [
    {
      id: 1,
      name: "Nolan Hu",
      role: "BASED dev",
      bio: "Puts the \"based\" in Based Sigma. Architect of systems that just work.",
      image: "/nolanPFP.png",
      github: "https://github.com/iamnolanhu",
      twitter: "https://x.com/its_nolan_hu",
      linkedin: "https://www.linkedin.com/in/nolanhu/"
    },
    {
      id: 2,
      name: "Apoorva",
      role: "Product Designer and Front-End Sigma",
      bio: "The product designer who sees opportunities where others see problems. Pure sigma energy..",
      image: "/aporvaPFP.jpg",
      github: "https://github.com/ApoorvaMahajan",
      twitter: "https://x.com/ApoorvaM94",
      linkedin: "https://www.linkedin.com/in/apoorva-mahajan94/"
    },
    {
      id: 3,
      name: "Brian Cardova",
      role: "Marketing Wizard",
      bio: "Spreads Sigma energy worldwide through marketing and content creation, based video editing skills",
      image: "/honeybPFP.jpg",
      twitter: "https://x.com/honeybdot",
      linkedin: "https://www.linkedin.com/in/cellocordova/"
    },
    {
      id: 4,
      name: "Suzanna Codes",
      role: "Designer and Front-End Developer",
      bio: "A sigma designer that is obsessed with coffee and making websites. Based in Toronto!",
      image: "/suzannaPFP.png",
      github: "https://github.com/codesuzyworld",
      twitter: "https://x.com/CodesSuzy19017",
      linkedin: "https://www.linkedin.com/in/codessuzy/"
    }
  ];

  // Tech stack data
  const techStack = [
    {
      name: "Bolt",
      description: "AI-powered development platform",
      logo: "/boltnewLogo.svg",
      color: "#6ad040"
    },
    {
      name: "Next.js",
      description: "React framework for production",
      logo: "/nextJSLogo.svg",
      color: "#ffffff"
    },
    {
      name: "Supabase",
      description: "Open source Postgres Development Platform.",
      logo: "/supabaseLogo.svg",
      color: "#3ecf8e"
    }
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] relative overflow-hidden">
      {/* Custom Bolt.new Badge */}
      <style>{`
        .bolt-badge {
          transition: all 0.3s ease;
        }
        @keyframes badgeIntro {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .bolt-badge-intro {
          animation: badgeIntro 1s ease-out 1s both;
        }
        .bolt-badge-intro.animated {
          animation: none;
        }
        @keyframes badgeHover {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(22deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .bolt-badge:hover {
          animation: badgeHover 0.6s ease-in-out;
        }
      `}</style>

      {/* Bolt.new Badge - Top Right */}
      <div className="fixed top-20 right-4 z-40">
        <a 
          href="https://bolt.new/?rid=hnomli" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block transition-all duration-300 hover:shadow-2xl"
        >
          <img 
            src="https://storage.bolt.army/white_circle_360x360.png" 
            alt="Built with Bolt.new badge" 
            className="w-16 h-16 md:w-20 md:h-20 rounded-full shadow-lg bolt-badge bolt-badge-intro"
            onAnimationEnd={(e) => e.currentTarget.classList.add('animated')}
          />
        </a>
      </div>

      {/* Matrix Background Animation */}
      <MatrixBackground className="z-[5]" />
      
      {/* Subtle overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/70 via-[#1a1a1a]/50 to-[#1a1a1a]/70 pointer-events-none z-[6]" />

      {/* Top radial gradient accent */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vw] h-[60vh] pointer-events-none z-[7]">
        <div className="w-full h-full rounded-full [background:radial-gradient(50%_50%_at_50%_50%,rgba(106,208,64,0.15)_0%,rgba(106,208,64,0.08)_30%,rgba(27,27,27,0)_70%)]" />
      </div>

      {/* Main content container - responsive */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Enhanced Navbar */}
        <Navbar />

        {/* Main content - responsive with top padding for fixed header */}
        <main className="flex-1 pt-16 md:pt-20">
          {/* Hero Section */}
          <section className="h-screen flex items-center justify-center container mx-auto px-4" style={{ height: 'calc(100vh - 4rem)' }}>
          <div className="max-w-4xl mx-auto">
            {/* Waitlist section - responsive */}
            <div className="text-center mb-6 md:mb-12 lg:mb-16">

              {/* Logo - responsive */}
              <div className="w-40 h-10 sm:w-48 sm:h-12 md:w-64 md:h-16 lg:w-80 lg:h-20 mx-auto mb-2 md:mb-4 bg-[url(/SigmaLogo.svg)] bg-contain bg-no-repeat bg-center filter drop-shadow-2xl drop-shadow-[#6ad040]/30" />
              
              {/* Tagline under logo */}
              <p className="font-['Orbitron'] font-semibold text-[#ffff] text-xs sm:text-sm md:text-base lg:text-lg uppercase tracking-wider mb-2 drop-shadow-lg drop-shadow-[#6ad040]/20 matrix-glow">
                AI Business automation for Sigmas
              </p>

              {/* Powered by Bolt text */}
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3 md:mb-6">
                <span className="font-['Space_Mono'] text-[#b7ffab] text-xs opacity-70">Built with</span>
                <img src="/boltnewLogo.svg" alt="Bolt" className="w-12 h-5 sm:w-16 sm:h-6 md:w-20 md:h-8 object-contain" />
                <span className="font-['Space_Mono'] text-[#b7ffab] text-xs opacity-70">For the Sigmas</span>
              </div>

            </div>
            
            <div className="mb-3 md:mb-6 lg:mb-8">
              <p className="font-['Space_Mono'] text-[#b7ffab] text-center text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed opacity-90 drop-shadow-lg mb-3 md:mb-4">
                POV: you want to start a business but every tutorial means you gotta listen to another NPC "expert"
              </p>
              
              {/* Bold "what if we just did all of it" text with glitch effect */}
              <p 
                className="font-['Orbitron'] font-black text-[#b7ffab] text-base sm:text-lg md:text-xl lg:text-2xl text-center max-w-2xl mx-auto leading-relaxed drop-shadow-xl drop-shadow-[#6ad040]/60 glitch-hover cursor-pointer"
                data-text="'what if we just... did all of it?'"
              >
                'what if we just... did all of it?'
              </p>
            </div>
            
            {/* Video/image placeholder - responsive */}
            <div className="mb-4 md:mb-8 lg:mb-12">
              <Card className="w-full max-w-2xl mx-auto aspect-video bg-black/40 backdrop-blur-md rounded-3xl border border-[#6ad040]/50 overflow-hidden hover:border-[#6ad040] transition-all duration-300 hover:shadow-2xl hover:shadow-[#6ad040]/30 group">
                <CardContent className="p-0 h-full flex items-center justify-center relative">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover rounded-3xl"
                    autoPlay
                    loop
                    playsInline
                    controls
                  >
                    <source src="/sigma_draft_1.mp4" type="video/mp4" />
                    {/* Fallback for browsers that don't support video */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-[#b7ffab]/70 font-['Space_Mono'] text-sm lg:text-base group-hover:text-[#6ad040] transition-colors duration-300">
                        Sigma Demo Video
                      </div>
                    </div>
                  </video>
                  
                  {/* Mute/Unmute Button */}
                  <button
                    onClick={toggleMute}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full border border-[#6ad040]/50 flex items-center justify-center hover:bg-black/80 hover:border-[#6ad040] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#6ad040]/50 z-20"
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-[#b7ffab] hover:text-[#6ad040] transition-colors duration-300" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-[#6ad040] hover:text-[#79e74c] transition-colors duration-300" />
                    )}
                  </button>
                  
                  {/* Subtle matrix overlay on video */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6ad040]/5 via-transparent to-[#6ad040]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </CardContent>
              </Card>
            </div>
          </div>
          </section>

          {/* Features Section */}
          <section id="feature" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a1a]/60 to-[#0f0f0f]/60 relative pt-8 md:pt-0">
            <div className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12 lg:mb-16">
                <h2 className="font-['Orbitron'] font-black text-[#ffff] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight mb-4 drop-shadow-2xl drop-shadow-[#6ad040]/50 matrix-glow">
                  BASED SIGMA FEATURES
                </h2>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed opacity-90">
                  Based Sigma helps you build your business from scratch.
                </p>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed opacity-90">
                  0 to CEO while you sleep.
                </p>
              </div>
            <div  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-24">
              {featureCards.map((card, index) => (
                <div key={index} className="relative group">
                  <div className="relative bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6 lg:p-8 h-full transition-all duration-500 hover:border-[#6ad040] hover:shadow-2xl hover:shadow-[#6ad040]/30 hover:bg-black/50 hover:scale-105 hover:-translate-y-2">
                    {/* Matrix-style glow effect on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6ad040]/10 via-transparent to-[#6ad040]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10">
                      {/* Icon - now uses the image from the card data */}
                      <img
                        className="w-22 h-24 lg:w-26 lg:h-30 mb-4 lg:mb-6 mx-auto opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 filter group-hover:drop-shadow-lg group-hover:drop-shadow-[#6ad040]/50"
                        alt="Feature icon"
                        src={card.image}
                      />

                      {/* Title */}
                      <h3 className="font-['Orbitron'] font-black text-[#79e84c] text-lg lg:text-xl xl:text-2xl mb-3 lg:mb-4 text-center group-hover:text-[#6ad040] transition-colors duration-300 group-hover:drop-shadow-lg min-h-[3.5rem] flex items-center justify-center">
                        {card.title}
                      </h3>

                      {/* Description */}
                      <p className="font-['Space_Mono'] text-[#b7ffab] text-sm lg:text-base leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
            </div>
          </section>

          {/* Tech Stack Section */}
          <section id="tech" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f0f0f]/60 to-[#1a1a1a]/60 relative pt-8 md:pt-0">
            <div className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
            <div className="max-w-5xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12 lg:mb-16">
                <h2 className="font-['Orbitron'] font-black text-[#ffff] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight mb-4 drop-shadow-2xl drop-shadow-[#6ad040]/50 matrix-glow">
                  TECH STACK
                </h2>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed opacity-90">
                  Built with cutting-edge technology for maximum sigma performance.
                </p>
              </div>

              {/* Tech Stack Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
                {techStack.map((tech, index) => (
                  <div key={index} className="relative group">
                    <div className="relative bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6 lg:p-8 h-full transition-all duration-500 hover:border-[#6ad040] hover:shadow-2xl hover:shadow-[#6ad040]/30 hover:bg-black/50 hover:scale-105 hover:-translate-y-2 text-center">
                      {/* Matrix-style glow effect on hover */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6ad040]/10 via-transparent to-[#6ad040]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative z-10">
                        {/* Logo/Icon */}
                        <div className="flex justify-center items-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <img src={tech.logo} alt={tech.name} className="w-36 h-16 lg:w-40 lg:h-20 object-contain" />
                        </div>

                        {/* Tech Name */}
                        {/* <h3 className="font-['Orbitron'] font-black text-[#b7ffab] text-xl lg:text-2xl mb-3 group-hover:text-[#6ad040] transition-colors duration-300 group-hover:drop-shadow-lg">
                          {tech.name}
                        </h3> */}

                        {/* Description */}
                        <p className="font-['Space_Mono'] text-[#b7ffab] text-sm lg:text-base leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                          {tech.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </section>

          {/* Team Section */}
          <section id="team" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a1a]/60 to-[#0f0f0f]/60 relative pt-8 md:pt-0">
            <div className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
            <div className="max-w-4xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12 lg:mb-16">
                <h2 className="font-['Orbitron'] font-black text-[#ffff] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight mb-4 drop-shadow-2xl drop-shadow-[#6ad040]/50 matrix-glow">
                  TEAM SIGMA
                </h2>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed opacity-90">
                  Meet the absolute legends building the future of business automation. Pure sigma energy, zero corporate BS.
                </p>
              </div>
              </div>

              {/* Team Members Grid - 2 per row with more space */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
                {teamMembers.map((member) => (
                  <div key={member.id} className="relative group">
                    <div className="relative bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-8 lg:p-10 h-full transition-all duration-500 hover:border-[#6ad040] hover:shadow-2xl hover:shadow-[#6ad040]/30 hover:bg-black/50 hover:scale-105 hover:-translate-y-2">
                      {/* Matrix-style glow effect on hover */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6ad040]/10 via-transparent to-[#6ad040]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative z-10 text-center">
                        {/* Profile Image */}
                        <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-6 rounded-full overflow-hidden border-2 border-[#6ad040]/50 group-hover:border-[#6ad040] transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#6ad040]/50">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* Name */}
                        <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl lg:text-2xl mb-3 group-hover:text-[#6ad040] transition-colors duration-300">
                          {member.name}
                        </h3>

                        {/* Role */}
                        <p className="font-['Space_Grotesk'] font-bold text-[#6ad040] text-base lg:text-lg mb-4 uppercase tracking-wide">
                          {member.role}
                        </p>

                        {/* Bio */}
                        <p className="font-['Space_Mono'] text-[#b7ffab] text-sm lg:text-base leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300 mb-6">
                          {member.bio}
                        </p>

                        {/* Social Icons - Only show if the link exists */}
                        <div className="flex justify-center gap-4">
                          {member.github && (
                            <a
                              href={member.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full border border-[#6ad040]/50 flex items-center justify-center hover:bg-black/60 hover:border-[#6ad040] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#6ad040]/50 group/icon"
                            >
                              <Github className="w-5 h-5 text-[#b7ffab] group-hover/icon:text-[#6ad040] transition-colors duration-300" />
                            </a>
                          )}
                          {member.twitter && (
                            <a
                              href={member.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full border border-[#6ad040]/50 flex items-center justify-center hover:bg-black/60 hover:border-[#6ad040] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#6ad040]/50 group/icon"
                            >
                              <XIcon className="w-5 h-5 text-[#b7ffab] group-hover/icon:text-[#6ad040] transition-colors duration-300" />
                            </a>
                          )}
                          {member.linkedin && (
                            <a
                              href={member.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full border border-[#6ad040]/50 flex items-center justify-center hover:bg-black/60 hover:border-[#6ad040] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#6ad040]/50 group/icon"
                            >
                              <Linkedin className="w-5 h-5 text-[#b7ffab] group-hover/icon:text-[#6ad040] transition-colors duration-300" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Waitlist Section */}
          <section id="waitlist" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f0f0f]/60 to-[#1a1a1a]/60 relative pt-8 md:pt-0">
            <div className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
            <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="font-['Orbitron'] font-black text-[#ffff] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight mb-6 drop-shadow-2xl drop-shadow-[#6ad040]/50 matrix-glow">
                JOIN THE WAITLIST
              </h2>
              <p className="font-['Space_Mono'] text-[#b7ffab] text-sm lg:text-base mb-8 opacity-90 max-w-2xl mx-auto">
                Ready to become a CEO while you sleep? Join the Sigma revolution and let AI handle the business building while you focus on your vision.
              </p>
              <WaitlistForm />
            </div>
            </div>
            </div>
          </section>
        </main>

        {/* Sigma AI Chatbox */}
        <ChatBox />
      </div>
    </div>
  );
};