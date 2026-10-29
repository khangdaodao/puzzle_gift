const HEARTS = Array.from({ length: 12 }, (_, i) => ({
  left: (i * 83) % 100,
  size: 14 + ((i * 7) % 18),
  delay: -((i * 1.9) % 14),
  duration: 12 + ((i * 5) % 9),
  top: 10 + ((i * 29) % 75), // used only when motion is reduced
}));

export function FloatingHearts() {
  return (
    <div className="hearts" aria-hidden="true">
      {HEARTS.map((h, i) => (
        <svg key={i} className="heart" viewBox="0 0 24 24" width={h.size} height={h.size} fill="currentColor"
          style={{ left: `${h.left}%`, top: `${h.top}%`, animationDelay: `${h.delay}s`, animationDuration: `${h.duration}s` }}>
          <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c2 0 3.6 1.1 5.6 3.2C14 6.1 15.600 5 17.600 5 21 5 23.100 8.400 21.600 11.800 19.500 16.400 12 21 12 21Z" />
        </svg>
      ))}
    </div>
  );
}
