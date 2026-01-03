import { Dumbbell } from "lucide-react";
import WorkoutForm from "@/components/WorkoutForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6 animate-in fade-in zoom-in duration-500">
        <Dumbbell className="text-violet-500 w-12 h-12" />
        <h1 className="text-5xl font-extrabold tracking-tighter">NEOFIT AI</h1>
      </div>
      
      <p className="text-zinc-400 text-center max-w-md mb-6 text-lg leading-relaxed">
        Entrenamientos inteligentes diseñados por IA. <br className="hidden md:block" /> 
        Tu cambio físico empieza hoy, bro.
      </p>

      <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <WorkoutForm />
      </div>

      <footer className="mt-12 text-zinc-600 text-sm">
        © 2026 NeoFit AI - Built for legends.
      </footer>
    </main>
  );
}