import React from 'react';
import { X, Users, Code2, Sparkles, Cpu, Layers } from 'lucide-react';
import { usePortfolioStore, portfolioActions } from '../../store/usePortfolioStore';

const TEAM = [
  {
    name: 'Alex Rivera',
    role: 'Principal Systems Architect',
    icon: <Cpu size={22} color="#38bdf8" />,
    avatarColor: 'rgba(56, 189, 248, 0.2)',
    skills: ['Kubernetes', 'Go', 'Distributed Systems', 'Kafka'],
    desc: 'Specializes in high-throughput cloud topology, zero-trust infrastructure, and low-latency distributed databases.',
  },
  {
    name: 'Elena Chen',
    role: 'Staff 3D WebGL Developer',
    icon: <Sparkles size={22} color="#ffb300" />,
    avatarColor: 'rgba(255, 179, 0, 0.2)',
    skills: ['Three.js', 'React Three Fiber', 'GLSL Shaders', 'WebGPU'],
    desc: 'Pioneering immersive 3D web experiences, GPU-accelerated graphics pipelines, and real-time interactive physics.',
  },
  {
    name: 'Marcus Thorne',
    role: 'Lead Agentic AI Engineer',
    icon: <Code2 size={22} color="#00e676" />,
    avatarColor: 'rgba(0, 230, 118, 0.2)',
    skills: ['LLMs', 'Agent Frameworks', 'PyTorch', 'Vector Search'],
    desc: 'Designs multi-agent orchestration architectures, autonomous software engineering agents, and evaluation guardrails.',
  },
  {
    name: 'Sarah Patel',
    role: 'VP of Product & Strategy',
    icon: <Layers size={22} color="#ec4899" />,
    avatarColor: 'rgba(236, 72, 153, 0.2)',
    skills: ['Product Discovery', 'Design Systems', 'Agile PI', 'Growth'],
    desc: 'Drives product vision, translates complex technology into customer value, and champions developer velocity.',
  },
];

export function TeamModal() {
  const activeModal = usePortfolioStore((s) => s.activeModal);

  if (activeModal !== 'team') return null;

  return (
    <div className="modal-backdrop" onClick={() => portfolioActions.closeModal()}>
      <div
        className="modal-content"
        style={{ maxWidth: '720px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={() => portfolioActions.closeModal()}
          title="Close (ESC)"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Users size={24} color="#f97316" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            Meet Team Abu (Q4 2026)
          </h2>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
          The architects, engineers, and product strategists powering Team Abu's Q4 2026 agile commitments.
        </p>

        {/* Team Grid */}
        <div className="team-grid">
          {TEAM.map((member, i) => (
            <div key={i} className="team-card">
              <div
                className="team-avatar"
                style={{ backgroundColor: member.avatarColor }}
              >
                {member.icon}
              </div>
              <div className="team-info">
                <h4>{member.name}</h4>
                <div className="role">{member.role}</div>
                <div className="desc">{member.desc}</div>

                {/* Skill Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
                  {member.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#ffffff',
                        color: '#0f172a',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button
            onClick={() => portfolioActions.closeModal()}
            style={{
              padding: '10px 26px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(2, 132, 199, 0.3)',
            }}
          >
            Back to Driving 🏎️
          </button>
        </div>
      </div>
    </div>
  );
}
