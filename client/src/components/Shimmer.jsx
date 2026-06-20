export default function Shimmer({ rows = 4 }) {
  return (
    <div className="shimmer-wrapper">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="shimmer-line"
          style={{
            height: i === 0 ? '28px' : '18px',
            width: i % 2 === 0 ? '80%' : '60%',
            marginBottom: '16px'
          }}
        />
      ))}
    </div>
  );
}
