export default function Footer() {
  return (
    <footer className="bg-secondary mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-secondary-foreground">
        <p>&copy; {new Date().getFullYear()} Impact Balance. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
