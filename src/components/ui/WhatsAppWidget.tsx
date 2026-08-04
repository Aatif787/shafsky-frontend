import { useState, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function WhatsAppWidget() {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Show a gentle notification tooltip after 4 seconds to welcome the user
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const waUrl =
    "https://wa.me/919599087959?text=Hi!%20I'm%20interested%20in%20booking%20airport%20concierge%20services.";

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 font-sans">
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="relative flex max-w-[280px] items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0d2a36]/90 p-4 text-[13px] text-white shadow-2xl backdrop-blur-md"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNotification(false);
              }}
              className="absolute right-2 top-2 text-white/40 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#5fb5ad] text-[#0d2a36]">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold text-[#5fb5ad]">Suswagatam Concierge</div>
              <div className="mt-0.5 text-white/80 leading-snug">
                Need slot check or quick booking assistance? Chat with us now.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowNotification(false)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#74d0c7] to-[#4fa098] shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all hover:shadow-[0_8px_30px_rgba(95,181,173,0.4)]"
      >
        {/* WhatsApp Icon SVG */}
        <svg
          className="h-7 w-7 fill-[#0d2a36] transition-transform duration-300 group-hover:rotate-6"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </motion.a>
    </div>
  );
}
