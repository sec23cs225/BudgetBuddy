export default function SummaryCard({ title, amount }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "20px",
        margin: "10px",
        width: "220px",
        textAlign: "center",
        borderRadius: "10px",
      }}
    >
      <h3>{title}</h3>
      <h2>₹{amount}</h2>
    </div>
  );
}