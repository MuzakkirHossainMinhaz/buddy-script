export function AuthError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="alert alert-danger py-2 _mar_b14" role="alert">
      {message}
    </div>
  );
}
