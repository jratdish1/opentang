import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="bg-navy-dark min-h-screen flex items-center justify-center">
      <div className="container-vic text-center py-20">
        <div className="font-heading text-gold text-8xl md:text-9xl mb-4">404</div>
        <h1 className="font-heading text-offwhite text-2xl md:text-3xl tracking-wider mb-4">
          Mission Not Found
        </h1>
        <p className="text-offwhite/60 max-w-md mx-auto mb-8 font-body">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <Link to="/" className="btn-primary no-underline">
          Return to Base <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
