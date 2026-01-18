import BookingForm from '@/components/BookingForm';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#E5DACE] p-4">
      {/* Header / Branding */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-2">Sisters & Brows</h1>
        <p className="text-stone-700 tracking-widest uppercase text-sm">Brows • Face • Lashes</p>
      </div>

      {/* The Form */}
      <BookingForm />
      
      {/* Footer */}
      <footer className="mt-12 text-stone-600 text-sm">
        <p>© 2026 Sisters and Brows - Lipa Branch</p>
      </footer>
    </main>
  );
}