"use client";

const projects = [
  {
    name: "Copyshop-SMAG",
    description: "Server + Web App + iOS App for print shop ordering. Customers order prints online, pay via Stripe, and receive SMS updates.",
    services: ["SQLite", "Stripe", "Twilio / SMS"],
    runs: "Mac mini (port 3000 server) · Vercel (web app)",
    repo: "coldloki/Copyshop-SMAG",
    status: "active",
  },
  {
    name: "Podcast Booking",
    description: "Studio booking platform with SSO, calendar integration, and automated email/SMS confirmations for studio reservations.",
    services: ["SQLite", "Authentik (SSO)", "Google Calendar API", "Stripe", "Resend (email)", "Twilio (SMS)"],
    runs: "Windows Server (localhost:3005)",
    repo: "coldloki/podcast-booking",
    status: "active",
  },
  {
    name: "SMAG-ISMS",
    description: "Internal admin system for managing SMAG operations, inventory, and workflows.",
    services: ["SQLite"],
    runs: "Mac mini",
    repo: "coldloki/SMAG-ISMS",
    status: "active",
  },
  {
    name: "QR Injection",
    description: "QR code injection system — generates and manages dynamic QR codes for print materials and campaigns.",
    services: [],
    runs: "Mac mini",
    repo: "coldloki/qr-injection",
    status: "in development",
  },
  {
    name: "UniFi Webhook",
    description: "Camera webhook alert processor for UniFi Protect — processes motion/AI detection events and routes notifications.",
    services: [],
    runs: "Mac mini",
    repo: "coldloki/unifi-webhook",
    status: "active",
  },
  {
    name: "Whisper-iOS",
    description: "Voice dictation iOS app using OpenAI Whisper for accurate, on-device transcription.",
    services: ["OpenAI Whisper API"],
    runs: "iOS Device",
    repo: "coldloki/Whisper-iOS",
    status: "in development",
  },
  {
    name: "Somewhere Pictures",
    description: "Marketing website for Somewhere Pictures — portfolio, services, and contact presence.",
    services: [],
    runs: "Vercel",
    repo: "coldloki/somewhere-pictures",
    status: "active",
  },
];

const statusConfig = {
  active: { label: "Active", className: "bg-emerald-100 text-emerald-700" },
  paused: { label: "Paused", className: "bg-amber-100 text-amber-700" },
  "in development": { label: "In Development", className: "bg-blue-100 text-blue-700" },
};

export default function ProjectsPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <p className="mt-1 text-sm text-gray-500">
          All active, paused, and in-development projects with their infrastructure details.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {projects.map((project) => {
          const status = statusConfig[project.status as keyof typeof statusConfig];
          return (
            <div
              key={project.name}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
            >
              <div className="p-5 flex flex-col gap-3 flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-semibold text-gray-900 leading-tight">
                    {project.name}
                  </h2>
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed flex-1">
                  {project.description}
                </p>

                {/* Services */}
                {project.services.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                      Services / APIs
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.services.map((service) => (
                        <span
                          key={service}
                          className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Runs */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    Runs on
                  </div>
                  <p className="text-sm text-gray-700">{project.runs}</p>
                </div>

                {/* Repo */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    GitHub
                  </div>
                  <a
                    href={`https://github.com/${project.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {project.repo}
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
