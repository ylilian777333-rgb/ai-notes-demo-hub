import type { ReactNode } from "react";

type P = { size?: number };
function S({ size = 24, children, fill = false }: { size?: number; children: ReactNode; fill?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">{children}</svg>
  );
}

export const Signal = (p: P) => <S {...p}><path d="M2 20h.01" /><path d="M7 20v-4" /><path d="M12 20v-8" /><path d="M17 20V8" /><path d="M22 20V4" /></S>;
export const Wifi = (p: P) => <S {...p}><path d="M12 20h.01" /><path d="M2 8.8a15 15 0 0 1 20 0" /><path d="M5 12.9a10 10 0 0 1 14 0" /><path d="M8.5 16.4a5 5 0 0 1 7 0" /></S>;
export const Check = (p: P) => <S {...p}><path d="M20 6 9 17l-5-5" /></S>;
export const Plus = (p: P) => <S {...p}><path d="M5 12h14" /><path d="M12 5v14" /></S>;
export const ArrowLeft = (p: P) => <S {...p}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></S>;
export const ChevronRight = (p: P) => <S {...p}><path d="m9 18 6-6-6-6" /></S>;
export const ChevronDown = (p: P) => <S {...p}><path d="m6 9 6 6 6-6" /></S>;
export const X = (p: P) => <S {...p}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></S>;
export const Info = (p: P) => <S {...p}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></S>;
export const FileText = (p: P) => <S {...p}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></S>;
export const CalendarDays = (p: P) => <S {...p}><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /></S>;
export const Clock3 = (p: P) => <S {...p}><circle cx="12" cy="12" r="10" /><path d="M12 6v6h4" /></S>;
export const Bell = (p: P) => <S {...p}><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /></S>;
export const MapPin = (p: P) => <S {...p}><path d="M20 10c0 4.4-8 12-8 12s-8-7.6-8-12a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></S>;
export const Car = (p: P) => <S {...p}><path d="M19 17h2l.6-2.5a6 6 0 0 0-.5-4.2l-.8-1.6A3 3 0 0 0 17.7 7H6.3a3 3 0 0 0-2.7 1.6l-.8 1.7a6 6 0 0 0-.5 4.2L3 17h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></S>;
export const TrainFront = (p: P) => <S {...p}><path d="M8 3.1V7a4 4 0 0 0 8 0V3.1" /><rect width="16" height="16" x="4" y="3" rx="5" /><path d="M4 11h16" /><path d="m8 19-2 3" /><path d="m18 22-2-3" /><path d="M9 15h.01" /><path d="M15 15h.01" /></S>;
export const Utensils = (p: P) => <S {...p}><path d="M3 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V2" /><path d="M5 11v11" /><path d="M19 2v20" /><path d="M19 11c2 0 2-2 2-5 0-2-1-4-2-4" /></S>;
export const Stethoscope = (p: P) => <S {...p}><path d="M4 3v6a5 5 0 0 0 10 0V3" /><path d="M3.5 3h2" /><path d="M12.5 3h2" /><path d="M9 14v2a5 5 0 0 0 10 0v-1" /><circle cx="20" cy="10" r="2" /></S>;
export const Luggage = (p: P) => <S {...p}><path d="M6 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M9 20v2" /><path d="M15 20v2" /><path d="M12 10v6" /></S>;
export const Compass = (p: P) => <S {...p}><circle cx="12" cy="12" r="10" /><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z" /></S>;
export const UserRound = (p: P) => <S {...p}><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></S>;
export const MoreVertical = (p: P) => <S {...p} fill><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></S>;
export const Sparkles = (p: P) => <S {...p} fill><path d="M12 2.5 13.9 9 20.5 11 13.9 13 12 19.5 10.1 13 3.5 11 10.1 9z" /><path d="M19 3.2 19.7 5.3 21.8 6 19.7 6.7 19 8.8 18.3 6.7 16.2 6 18.3 5.3z" /></S>;
