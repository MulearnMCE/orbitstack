export function Footer() {
  return (
    <footer className="border-t-4 border-white bg-black py-8 mt-16">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p className="text-sm font-bold uppercase tracking-widest text-white">
          ORBITSTACK — mu@mce &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
