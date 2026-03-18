export default function ErrorMessage({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="error-box" role="alert">
      {message}
    </div>
  );
}
