
interface ContactSectionProps {
  contactName: string;
  setContactName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  nameLabel?: string;
  namePlaceholder?: string;
}

export function ContactSection({
  contactName,
  setContactName,
  phone,
  setPhone,
  email,
  setEmail,
  nameLabel = "Contact Name *",
  namePlaceholder = "Full Name",
}: ContactSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
      <div>
        <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
          {nameLabel}
        </label>
        <input
          type="text"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder={namePlaceholder}
          style={{ 
            height: "clamp(44px, 4.5vw, 52px)",
            fontSize: "clamp(12px, 1.2vw, 14px)",
            paddingLeft: "clamp(12px, 1.5vw, 16px)",
            paddingRight: "clamp(12px, 1.5vw, 16px)"
          }}
          className="w-full rounded-2xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
          Phone Number *
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Mobile number"
          style={{ 
            height: "clamp(44px, 4.5vw, 52px)",
            fontSize: "clamp(12px, 1.2vw, 14px)",
            paddingLeft: "clamp(12px, 1.5vw, 16px)",
            paddingRight: "clamp(12px, 1.5vw, 16px)"
          }}
          className="w-full rounded-2xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider font-bold mb-1.5">
          Email *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          style={{ 
            height: "clamp(44px, 4.5vw, 52px)",
            fontSize: "clamp(12px, 1.2vw, 14px)",
            paddingLeft: "clamp(12px, 1.5vw, 16px)",
            paddingRight: "clamp(12px, 1.5vw, 16px)"
          }}
          className="w-full rounded-2xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs font-sans font-medium"
        />
      </div>
    </div>
  );
}
